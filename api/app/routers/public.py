import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.db import get_db
from app.core.config import get_settings
from app.models.project import Project
from app.models.file import File as FileModel
from app.services import invite_service, submission_service, project_service, notification_service
from app.schemas.submission import DraftUpsert, PublicInviteResponse
from app.schemas.design_rules import DesignRules
from app.schemas.common import err

router = APIRouter()
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf"}


@router.get("/invite/{token}")
@limiter.limit("60/minute")
async def get_invite(request: Request, token: str, db: AsyncSession = Depends(get_db)):
    invite = await invite_service.get_invite_by_token(db, token)
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail=err("not_found", "Invite not found or expired"))
    await invite_service.mark_first_opened(db, invite)
    result = await db.execute(select(Project).where(Project.id == invite.project_id))
    project = result.scalar_one_or_none()
    draft = await submission_service.get_draft(db, invite.project_id)
    return {
        "invite_id": str(invite.id),
        "project_id": str(project.id),
        "brand_name": project.brand_name,
        "project_type": project.project_type,
        "client_name": project.client_name,
        "project_status": project.status,
        "draft_rules": draft.rules if draft else {},
    }


@router.put("/invite/{token}/draft")
@limiter.limit("120/minute")
async def save_draft(request: Request, token: str, body: DraftUpsert, db: AsyncSession = Depends(get_db)):
    invite = await invite_service.get_invite_by_token(db, token)
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail=err("not_found", "Invite not found or expired"))
    draft = await submission_service.upsert_draft(db, invite.project_id, body.rules)
    return {"updated_at": draft.updated_at.isoformat()}


@router.post("/invite/{token}/submit")
@limiter.limit("10/minute")
async def submit(request: Request, token: str, body: DraftUpsert, db: AsyncSession = Depends(get_db)):
    invite = await invite_service.get_invite_by_token(db, token)
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail=err("not_found", "Invite not found or expired"))

    # Validate rules against DesignRules schema
    try:
        DesignRules.model_validate(body.rules)
    except Exception as e:
        raise HTTPException(status_code=422, detail=err("validation_error", str(e)))

    submission = await submission_service.submit(db, invite.project_id, body.rules)

    # Notify designer
    result = await db.execute(select(Project).where(Project.id == invite.project_id))
    project = result.scalar_one_or_none()
    from sqlalchemy import select as sel
    from app.models.user import User
    designer_res = await db.execute(sel(User).where(User.id == project.owner_id))
    designer = designer_res.scalar_one_or_none()
    if designer:
        project_url = f"{settings.frontend_url}/projects/{project.id}/submissions/{submission.version}"
        import asyncio
        asyncio.create_task(
            notification_service.notify_submission(
                designer_email=designer.email,
                project_name=project.brand_name,
                client_name=project.client_name,
                version=submission.version,
                project_url=project_url,
            )
        )

    return {"version": submission.version, "submitted_at": submission.submitted_at.isoformat()}


@router.post("/invite/{token}/files")
@limiter.limit("20/minute")
async def upload_file(
    request: Request,
    token: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    invite = await invite_service.get_invite_by_token(db, token)
    if not invite or not invite.is_active:
        raise HTTPException(status_code=404, detail=err("not_found", "Invite not found or expired"))

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=err("invalid_file", "File type not allowed"))

    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail=err("file_too_large", f"Max {settings.max_upload_size_mb} MB"))

    upload_dir = os.path.join(settings.upload_dir, str(invite.project_id))
    os.makedirs(upload_dir, exist_ok=True)
    storage_key = f"{invite.project_id}/{uuid.uuid4()}_{file.filename}"
    path = os.path.join(settings.upload_dir, storage_key)
    with open(path, "wb") as f:
        f.write(content)

    file_record = FileModel(
        project_id=invite.project_id,
        filename=file.filename or "upload",
        mime_type=file.content_type,
        size=len(content),
        storage_key=storage_key,
    )
    db.add(file_record)
    await db.flush()
    return {"id": str(file_record.id), "filename": file_record.filename, "size": file_record.size}
