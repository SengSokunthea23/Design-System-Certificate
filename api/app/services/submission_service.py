from datetime import datetime, timezone
from uuid import UUID
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.submission import Submission, SubmissionStatus
from app.models.project import Project, ProjectStatus
from app.models.draft import Draft
from app.models.comment import Comment, AuthorType
from app.models.activity_log import ActivityLog
from app.schemas.design_rules import DesignRules


async def upsert_draft(db: AsyncSession, project_id: UUID, rules: dict) -> Draft:
    result = await db.execute(select(Draft).where(Draft.project_id == project_id))
    draft = result.scalar_one_or_none()
    if draft is None:
        draft = Draft(project_id=project_id, rules=rules)
        db.add(draft)
    else:
        draft.rules = rules
        draft.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return draft


async def get_draft(db: AsyncSession, project_id: UUID) -> Draft | None:
    result = await db.execute(select(Draft).where(Draft.project_id == project_id))
    return result.scalar_one_or_none()


async def submit(db: AsyncSession, project_id: UUID, rules: dict) -> Submission:
    max_ver = await db.execute(
        select(func.coalesce(func.max(Submission.version), 0)).where(Submission.project_id == project_id)
    )
    version = max_ver.scalar_one() + 1

    submission = Submission(project_id=project_id, version=version, rules=rules)
    db.add(submission)

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        project.status = ProjectStatus.submitted

    db.add(ActivityLog(project_id=project_id, actor="client", action="submitted", meta={"version": version}))
    await db.flush()
    return submission


async def list_submissions(db: AsyncSession, project_id: UUID) -> list[Submission]:
    result = await db.execute(
        select(Submission).where(Submission.project_id == project_id).order_by(Submission.version.asc())
    )
    return result.scalars().all()


async def get_submission(db: AsyncSession, project_id: UUID, version: int) -> Submission | None:
    result = await db.execute(
        select(Submission).where(Submission.project_id == project_id, Submission.version == version)
    )
    return result.scalar_one_or_none()


async def compare_submissions(
    db: AsyncSession, project_id: UUID, from_ver: int, to_ver: int
) -> dict:
    s_from = await get_submission(db, project_id, from_ver)
    s_to = await get_submission(db, project_id, to_ver)
    if not s_from or not s_to:
        return {}

    def flatten(d: dict, prefix: str = "") -> dict[str, Any]:
        items = {}
        for k, v in d.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                items.update(flatten(v, key))
            else:
                items[key] = v
        return items

    flat_from = flatten(s_from.rules)
    flat_to = flatten(s_to.rules)
    changed = [k for k in set(list(flat_from.keys()) + list(flat_to.keys()))
               if flat_from.get(k) != flat_to.get(k)]

    return {
        "from_version": from_ver,
        "to_version": to_ver,
        "from_rules": s_from.rules,
        "to_rules": s_to.rules,
        "changed_paths": sorted(changed),
    }


async def approve(db: AsyncSession, project: Project, submission: Submission, actor_id: UUID) -> None:
    submission.status = SubmissionStatus.approved
    project.status = ProjectStatus.approved
    db.add(ActivityLog(project_id=project.id, actor=f"user:{actor_id}", action="approved", meta={"version": submission.version}))
    await db.flush()


async def request_changes(
    db: AsyncSession, project: Project, submission: Submission, comment: str, actor_id: UUID
) -> None:
    submission.status = SubmissionStatus.changes_requested
    project.status = ProjectStatus.changes_requested
    db.add(Comment(
        project_id=project.id,
        submission_id=submission.id,
        author_type=AuthorType.designer,
        author_id=actor_id,
        body=comment,
    ))
    db.add(ActivityLog(project_id=project.id, actor=f"user:{actor_id}", action="changes_requested", meta={"version": submission.version}))
    await db.flush()
