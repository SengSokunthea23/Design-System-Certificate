from typing import Annotated, Literal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import project_service, submission_service, export_service
from app.schemas.common import err

router = APIRouter()


async def _get_latest_rules(db, project_id: UUID, project) -> dict:
    submissions = await submission_service.list_submissions(db, project_id)
    if not submissions:
        raise HTTPException(status_code=404, detail=err("no_submissions", "No submissions to export"))
    return submissions[-1].rules


@router.get("/{project_id}/export")
async def export_tokens(
    project_id: UUID,
    format: Annotated[Literal["css", "tailwind", "json", "figma", "pdf"], Query()] = "css",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=err("not_found", "Project not found"))
    rules = await _get_latest_rules(db, project_id, project)
    brand_name = rules.get("project_info", {}).get("brand_name", project.brand_name)

    if format == "css":
        content = export_service.to_css_variables(rules)
        return Response(content=content, media_type="text/css",
                        headers={"Content-Disposition": f'attachment; filename="{brand_name}-tokens.css"'})
    elif format == "tailwind":
        content = export_service.to_tailwind_theme(rules)
        return Response(content=content, media_type="text/css",
                        headers={"Content-Disposition": f'attachment; filename="{brand_name}-theme.css"'})
    elif format == "json":
        content = export_service.to_w3c_tokens(rules)
        return Response(content=content, media_type="application/json",
                        headers={"Content-Disposition": f'attachment; filename="{brand_name}-tokens.json"'})
    elif format == "figma":
        content = export_service.to_figma_tokens(rules)
        return Response(content=content, media_type="application/json",
                        headers={"Content-Disposition": f'attachment; filename="{brand_name}-figma-tokens.json"'})
    elif format == "pdf":
        html = export_service.to_pdf_html(rules, brand_name)
        return Response(content=html, media_type="text/html",
                        headers={"Content-Disposition": f'inline; filename="{brand_name}-brief.html"'})
