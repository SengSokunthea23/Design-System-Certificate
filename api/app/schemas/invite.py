from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class InviteCreate(BaseModel):
    expires_days: int = 30


class InviteResponse(BaseModel):
    id: UUID
    project_id: UUID
    expires_at: datetime
    revoked_at: datetime | None
    first_opened_at: datetime | None
    created_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class InviteWithToken(InviteResponse):
    # Raw token returned ONCE at creation — never stored, only the hash is in DB
    token: str
