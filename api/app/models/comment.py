import enum
from datetime import datetime
from uuid import UUID
from sqlalchemy import Text, Enum as SAEnum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7
from app.models.base import Base


class AuthorType(str, enum.Enum):
    designer = "designer"
    client = "client"


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    author_type: Mapped[AuthorType] = mapped_column(
        SAEnum(AuthorType, name="author_type"), nullable=False
    )
    # Null for client authors (no account)
    author_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    project: Mapped["Project"] = relationship(back_populates="comments")  # noqa: F821
    submission: Mapped["Submission | None"] = relationship(back_populates="comments")  # noqa: F821
