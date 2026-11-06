import enum
from datetime import date, datetime
from uuid import UUID
from sqlalchemy import String, Text, Enum as SAEnum, DateTime, Date, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid6 import uuid7
from app.models.base import Base


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    submitted = "submitted"
    changes_requested = "changes_requested"
    approved = "approved"


class ProjectType(str, enum.Enum):
    website = "website"
    mobile_app = "mobile_app"
    brand_identity = "brand_identity"
    social_media = "social_media"


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (Index("ix_projects_status", "status"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # {email, phone, telegram}
    client_contact: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    brand_name: Mapped[str] = mapped_column(String(255), nullable=False)
    project_type: Mapped[ProjectType] = mapped_column(
        SAEnum(ProjectType, name="project_type"), nullable=False
    )
    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus, name="project_status"),
        nullable=False,
        default=ProjectStatus.draft,
    )
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(back_populates="projects")  # noqa: F821
    invites: Mapped[list["Invite"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    submissions: Mapped[list["Submission"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    draft: Mapped["Draft | None"] = relationship(back_populates="project", uselist=False, cascade="all, delete-orphan")  # noqa: F821
    comments: Mapped[list["Comment"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    files: Mapped[list["File"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
    activity_logs: Mapped[list["ActivityLog"]] = relationship(back_populates="project", cascade="all, delete-orphan")  # noqa: F821
