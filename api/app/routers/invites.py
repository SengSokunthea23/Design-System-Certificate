from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.config import get_settings
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.invite import Invite
from app.services import invite_service, project_service
from app.schemas.invite import InviteCreate, InviteResponse, InviteWithToken
from app.schemas.common import err

router = APIRouter()
settings = get_settings()


def _check_access(user: User, project) -> None:
    if user.role == UserRole.admin:
        return
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail=err("forbidden", "Access denied"))


@router.post("/{project_id}/invites", response_model=InviteWithToken, status_code=201)
async def create_invite(
    project_id: UUID,
    body: InviteCreate = InviteCreate(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    invite, token = await invite_service.create_invite(db, project, body.expires_days, f"user:{current_user.id}")
    result = InviteWithToken.model_validate(invite)
    result.token = token
    return result


@router.get("/{project_id}/invites", response_model=list[InviteResponse])
async def list_invites(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    result = await db.execute(select(Invite).where(Invite.project_id == project_id))
    return result.scalars().all()


@router.post("/invites/{invite_id}/revoke", response_model=InviteResponse)
async def revoke_invite(
    invite_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Invite).where(Invite.id == invite_id))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=404, detail=err("not_found", "Invite not found"))
    project = await project_service.get_project(db, invite.project_id)
    _check_access(current_user, project)
    await invite_service.revoke_invite(db, invite, f"user:{current_user.id}")
    return invite
