from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.preset import Preset, PresetKind
from app.schemas.preset import PresetCreate, PresetUpdate


async def list_presets(db: AsyncSession, kind: PresetKind | None = None, active_only: bool = True) -> list[Preset]:
    q = select(Preset)
    if kind:
        q = q.where(Preset.kind == kind)
    if active_only:
        q = q.where(Preset.is_active == True)  # noqa: E712
    q = q.order_by(Preset.sort_order.asc(), Preset.name.asc())
    result = await db.execute(q)
    return result.scalars().all()


async def create_preset(db: AsyncSession, data: PresetCreate) -> Preset:
    preset = Preset(**data.model_dump())
    db.add(preset)
    await db.flush()
    return preset


async def get_preset(db: AsyncSession, preset_id: UUID) -> Preset | None:
    result = await db.execute(select(Preset).where(Preset.id == preset_id))
    return result.scalar_one_or_none()


async def update_preset(db: AsyncSession, preset: Preset, data: PresetUpdate) -> Preset:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(preset, field, value)
    await db.flush()
    return preset


async def delete_preset(db: AsyncSession, preset: Preset) -> None:
    await db.delete(preset)
    await db.flush()
