import enum
from datetime import datetime
from uuid import UUID
from sqlalchemy import Integer, Enum as SAEnum, DateTime, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7
from app.models.base import Base


class SubmissionStatus(str, enum.Enum):
    submitted = "submitted"
    changes_requested = "changes_requested"
    approved = "approved"


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        UniqueConstraint("project_id", "version", name="uq_submissions_project_version"),
        Index("ix_submissions_project_id", "project_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[SubmissionStatus] = mapped_column(
        SAEnum(SubmissionStatus, name="submission_status"),
        nullable=False,
        default=SubmissionStatus.submitted,
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    project: Mapped["Project"] = relationship(back_populates="submissions")  # noqa: F821
    comments: Mapped[list["Comment"]] = relationship(back_populates="submission")  # noqa: F821
