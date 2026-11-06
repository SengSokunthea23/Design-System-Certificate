from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.preset import PresetKind
from app.services import preset_service
from app.schemas.preset import PresetCreate, PresetUpdate, PresetResponse
from app.schemas.common import err

router = APIRouter()


@router.get("", response_model=list[PresetResponse])
async def list_presets(
    kind: PresetKind | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await preset_service.list_presets(db, kind=kind, active_only=False)


@router.get("/public", response_model=list[PresetResponse])
async def list_public_presets(
    kind: PresetKind | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await preset_service.list_presets(db, kind=kind, active_only=True)


@router.post("", response_model=PresetResponse, status_code=201)
async def create_preset(
    body: PresetCreate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    return await preset_service.create_preset(db, body)


@router.patch("/{preset_id}", response_model=PresetResponse)
async def update_preset(
    preset_id: UUID,
    body: PresetUpdate,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    preset = await preset_service.get_preset(db, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail=err("not_found", "Preset not found"))
    return await preset_service.update_preset(db, preset, body)


@router.delete("/{preset_id}", status_code=204)
async def delete_preset(
    preset_id: UUID,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    preset = await preset_service.get_preset(db, preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail=err("not_found", "Preset not found"))
    await preset_service.delete_preset(db, preset)
