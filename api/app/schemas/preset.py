from uuid import UUID
from datetime import datetime
from typing import Any
from pydantic import BaseModel
from app.models.preset import PresetKind


class PresetCreate(BaseModel):
    kind: PresetKind
    name: str
    data: dict[str, Any] = {}
    sort_order: int = 0
    is_active: bool = True


class PresetUpdate(BaseModel):
    name: str | None = None
    data: dict[str, Any] | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class PresetResponse(BaseModel):
    id: UUID
    kind: PresetKind
    name: str
    data: dict[str, Any]
    sort_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
