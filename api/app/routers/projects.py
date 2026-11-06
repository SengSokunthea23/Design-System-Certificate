from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.project import ProjectStatus
from app.services import project_service
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.schemas.common import err

router = APIRouter()


def _check_access(user: User, project) -> None:
    if user.role == UserRole.admin:
        return
    if project.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=err("forbidden", "Access denied"))


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    status: ProjectStatus | None = Query(default=None),
    search: str | None = Query(default=None),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    owner_id = None if current_user.role == UserRole.admin else current_user.id
    items, total = await project_service.list_projects(db, owner_id=owner_id, status=status, search=search, offset=offset, limit=limit)
    return {"items": items, "total": total}


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.create_project(db, current_user.id, body)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    return await project_service.update_project(db, project, body)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    await project_service.delete_project(db, project)
