import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ScanResult(Base):
    __tablename__ = "scan_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(Uuid(), ForeignKey("organizations.id"), nullable=False)
    aws_connection_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(), ForeignKey("aws_connections.id"))
    product: Mapped[str] = mapped_column(String(50), nullable=False)  # finops / cloudguard / infrascore / supplyguard / zerovis
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending / running / completed / failed
    result: Mapped[dict | None] = mapped_column(JSON)
    report_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    organization: Mapped["Organization"] = relationship("Organization", back_populates="scan_results")
    aws_connection: Mapped["AwsConnection | None"] = relationship("AwsConnection", back_populates="scan_results")
