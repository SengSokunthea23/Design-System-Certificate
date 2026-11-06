import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.invite import Invite
from app.models.project import Project
from app.models.activity_log import ActivityLog
from app.core.config import get_settings

settings = get_settings()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def create_invite(db: AsyncSession, project: Project, expires_days: int, actor: str) -> tuple[Invite, str]:
    token = secrets.token_urlsafe(32)
    token_hash = _hash_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_days)
    invite = Invite(project_id=project.id, token_hash=token_hash, expires_at=expires_at)
    db.add(invite)
    db.add(ActivityLog(project_id=project.id, actor=actor, action="invite_created", meta={"expires_days": expires_days}))
    await db.flush()
    return invite, token


async def get_invite_by_token(db: AsyncSession, token: str) -> Invite | None:
    token_hash = _hash_token(token)
    result = await db.execute(select(Invite).where(Invite.token_hash == token_hash))
    return result.scalar_one_or_none()


async def mark_first_opened(db: AsyncSession, invite: Invite) -> None:
    if invite.first_opened_at is None:
        invite.first_opened_at = datetime.now(timezone.utc)
        db.add(ActivityLog(
            project_id=invite.project_id,
            actor="client",
            action="invite_opened",
            meta={}
        ))
        await db.flush()


async def revoke_invite(db: AsyncSession, invite: Invite, actor: str) -> None:
    invite.revoked_at = datetime.now(timezone.utc)
    db.add(ActivityLog(
        project_id=invite.project_id,
        actor=actor,
        action="invite_revoked",
        meta={}
    ))
    await db.flush()
