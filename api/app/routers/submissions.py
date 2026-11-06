from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.submission import SubmissionStatus
from app.services import submission_service, project_service
from app.schemas.submission import SubmissionResponse, RequestChangesBody, CompareResponse
from app.schemas.common import err

router = APIRouter()


def _check_access(user: User, project) -> None:
    if user.role == UserRole.admin:
        return
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail=err("forbidden", "Access denied"))


@router.get("/{project_id}/submissions", response_model=list[SubmissionResponse])
async def list_submissions(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    return await submission_service.list_submissions(db, project_id)


@router.get("/{project_id}/submissions/{version}", response_model=SubmissionResponse)
async def get_submission(
    project_id: UUID,
    version: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    sub = await submission_service.get_submission(db, project_id, version)
    if not sub:
        raise HTTPException(status_code=404, detail=err("not_found", "Submission not found"))
    return sub


@router.get("/{project_id}/compare", response_model=CompareResponse)
async def compare(
    project_id: UUID,
    from_version: int = Query(alias="from"),
    to_version: int = Query(alias="to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    result = await submission_service.compare_submissions(db, project_id, from_version, to_version)
    if not result:
        raise HTTPException(status_code=404, detail=err("not_found", "One or both versions not found"))
    return result


@router.post("/{project_id}/approve")
async def approve(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    submissions = await submission_service.list_submissions(db, project_id)
    if not submissions:
        raise HTTPException(status_code=400, detail=err("no_submissions", "No submissions to approve"))
    latest = submissions[-1]
    await submission_service.approve(db, project, latest, current_user.id)
    return {"ok": True}


@router.post("/{project_id}/request-changes")
async def request_changes(
    project_id: UUID,
    body: RequestChangesBody,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    _check_access(current_user, project)
    submissions = await submission_service.list_submissions(db, project_id)
    if not submissions:
        raise HTTPException(status_code=400, detail=err("no_submissions", "No submissions"))
    latest = submissions[-1]
    await submission_service.request_changes(db, project, latest, body.comment, current_user.id)
    return {"ok": True}
