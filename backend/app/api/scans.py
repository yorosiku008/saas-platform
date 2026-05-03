import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.scan_result import ScanResult
from app.models.aws_connection import AwsConnection
from app.models.user import User
from app.api.schemas import ScanCreate, ScanResponse
from app.api.deps import get_current_user
from app.services.scan_engine import run_scan

router = APIRouter(prefix="/scans", tags=["scans"])

VALID_PRODUCTS = {"finops", "cloudguard", "infrascore", "supplyguard", "zerovis"}


async def _execute_scan(scan_id: uuid.UUID, product: str, role_arn: str | None, demo: bool, db_url: str):
    try:
        await _do_execute_scan(scan_id, product, role_arn, demo, db_url)
    except Exception:
        pass  # バックグラウンドタスクの失敗はリクエストに影響しない


async def _do_execute_scan(scan_id: uuid.UUID, product: str, role_arn: str | None, demo: bool, db_url: str):
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from app.core.config import settings

    engine = create_async_engine(settings.database_url)
    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    async with session_maker() as db:
        result = await db.execute(select(ScanResult).where(ScanResult.id == scan_id))
        scan = result.scalar_one_or_none()
        if not scan:
            return

        scan.status = "running"
        await db.commit()

        try:
            scan_result = run_scan(product, role_arn=role_arn, demo=demo)
            scan.result = scan_result
            scan.status = "completed"
        except Exception as e:
            scan.result = {"error": str(e)}
            scan.status = "failed"
        finally:
            scan.completed_at = datetime.now(timezone.utc)
            await db.commit()

    await engine.dispose()


@router.post("/", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(
    body: ScanCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.product not in VALID_PRODUCTS:
        raise HTTPException(status_code=400, detail=f"product must be one of {VALID_PRODUCTS}")

    role_arn = None
    if body.aws_connection_id and not body.demo_mode:
        r = await db.execute(
            select(AwsConnection).where(
                AwsConnection.id == body.aws_connection_id,
                AwsConnection.org_id == current_user.org_id,
            )
        )
        conn = r.scalar_one_or_none()
        if not conn:
            raise HTTPException(status_code=404, detail="AWS connection not found")
        role_arn = conn.role_arn

    scan = ScanResult(org_id=current_user.org_id, product=body.product, aws_connection_id=body.aws_connection_id)
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    from app.core.config import settings
    background_tasks.add_task(_execute_scan, scan.id, body.product, role_arn, body.demo_mode, settings.database_url)

    return scan


@router.get("/", response_model=list[ScanResponse])
async def list_scans(
    product: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ScanResult).where(ScanResult.org_id == current_user.org_id).order_by(ScanResult.created_at.desc())
    if product:
        stmt = stmt.where(ScanResult.product == product)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Scan not found")
    result = await db.execute(
        select(ScanResult).where(ScanResult.id == scan_uuid, ScanResult.org_id == current_user.org_id)
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
