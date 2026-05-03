import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

PLAN_PRICE_IDS = {
    "starter": "price_starter",   # Stripe Price ID（本番環境で設定）
    "pro": "price_pro",
    "enterprise": "price_enterprise",
}

PLAN_SCAN_LIMITS = {
    "free": 3,
    "starter": 30,
    "pro": -1,        # 無制限
    "enterprise": -1,
}


@router.post("/create-checkout-session")
async def create_checkout_session(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    if plan not in PLAN_PRICE_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {plan}")

    stripe.api_key = settings.stripe_secret_key

    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()

    customer_id = org.stripe_customer_id if org else None
    if not customer_id:
        customer = stripe.Customer.create(email=current_user.email, name=org.name if org else "")
        customer_id = customer.id
        if org:
            org.stripe_customer_id = customer_id
            await db.commit()

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": PLAN_PRICE_IDS[plan], "quantity": 1}],
        mode="subscription",
        success_url="http://localhost:3000/dashboard?upgraded=1",
        cancel_url="http://localhost:3000/dashboard/billing",
        metadata={"org_id": str(current_user.org_id), "plan": plan},
    )

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    payload = await request.body()
    try:
        stripe.api_key = settings.stripe_secret_key
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.stripe_webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        org_id = session["metadata"].get("org_id")
        plan = session["metadata"].get("plan")
        if org_id and plan:
            result = await db.execute(select(Organization).where(Organization.id == org_id))
            org = result.scalar_one_or_none()
            if org:
                org.plan = plan
                await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"]["customer"]
        result = await db.execute(
            select(Organization).where(Organization.stripe_customer_id == customer_id)
        )
        org = result.scalar_one_or_none()
        if org:
            org.plan = "free"
            await db.commit()

    return {"received": True}


@router.get("/current-plan")
async def current_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()
    plan = org.plan if org else "free"
    return {
        "plan": plan,
        "scan_limit": PLAN_SCAN_LIMITS.get(plan, 3),
        "features": {
            "ai_suggestions": plan != "free",
            "unlimited_scans": plan in ("pro", "enterprise"),
            "multi_user": plan in ("pro", "enterprise"),
        },
    }
