from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.aws_connection import AwsConnection
from app.models.user import User
from app.api.schemas import AwsConnectionCreate, AwsConnectionResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/aws-connections", tags=["aws-connections"])


@router.post("/", response_model=AwsConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    body: AwsConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conn = AwsConnection(org_id=current_user.org_id, **body.model_dump())
    db.add(conn)
    await db.commit()
    await db.refresh(conn)
    return conn


@router.get("/", response_model=list[AwsConnectionResponse])
async def list_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AwsConnection).where(AwsConnection.org_id == current_user.org_id))
    return result.scalars().all()


@router.delete("/{conn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    conn_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AwsConnection).where(AwsConnection.id == conn_id, AwsConnection.org_id == current_user.org_id)
    )
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    await db.delete(conn)
    await db.commit()
