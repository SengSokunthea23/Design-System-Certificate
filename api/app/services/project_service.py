from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.project import Project, ProjectStatus
from app.models.activity_log import ActivityLog
from app.schemas.project import ProjectCreate, ProjectUpdate


async def list_projects(
    db: AsyncSession,
    owner_id: UUID | None = None,
    status: ProjectStatus | None = None,
    search: str | None = None,
    offset: int = 0,
    limit: int = 50,
) -> tuple[list[Project], int]:
    q = select(Project)
    if owner_id:
        q = q.where(Project.owner_id == owner_id)
    if status:
        q = q.where(Project.status == status)
    if search:
        term = f"%{search}%"
        q = q.where(or_(Project.client_name.ilike(term), Project.brand_name.ilike(term)))
    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar_one()
    q = q.order_by(Project.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(q)
    return result.scalars().all(), total


async def create_project(db: AsyncSession, owner_id: UUID, data: ProjectCreate) -> Project:
    project = Project(
        owner_id=owner_id,
        client_name=data.client_name,
        client_contact=data.client_contact.model_dump(exclude_none=True),
        brand_name=data.brand_name,
        project_type=data.project_type,
        deadline=data.deadline,
        internal_notes=data.internal_notes,
    )
    db.add(project)
    await db.flush()
    await _log(db, project.id, f"user:{owner_id}", "project_created", {"brand_name": project.brand_name})
    return project


async def get_project(db: AsyncSession, project_id: UUID) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def update_project(db: AsyncSession, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    await db.flush()
    return project


async def delete_project(db: AsyncSession, project: Project) -> None:
    await db.delete(project)
    await db.flush()


async def _log(db: AsyncSession, project_id: UUID, actor: str, action: str, meta: dict) -> None:
    db.add(ActivityLog(project_id=project_id, actor=actor, action=action, meta=meta))
    await db.flush()
