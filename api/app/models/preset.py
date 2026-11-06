import enum
from datetime import datetime
from uuid import UUID
from sqlalchemy import String, Integer, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from uuid6 import uuid7
from app.models.base import Base


class PresetKind(str, enum.Enum):
    style = "style"
    palette = "palette"
    font = "font"
    khmer_font = "khmer_font"


class Preset(Base):
    __tablename__ = "presets"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    kind: Mapped[PresetKind] = mapped_column(
        SAEnum(PresetKind, name="preset_kind"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
