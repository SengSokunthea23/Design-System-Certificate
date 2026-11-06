from datetime import datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel
from app.models.submission import SubmissionStatus
from app.schemas.design_rules import DesignRules


class SubmissionResponse(BaseModel):
    id: UUID
    project_id: UUID
    version: int
    rules: dict[str, Any]
    status: SubmissionStatus
    submitted_at: datetime

    model_config = {"from_attributes": True}


class RequestChangesBody(BaseModel):
    comment: str


class CompareResponse(BaseModel):
    from_version: int
    to_version: int
    from_rules: dict[str, Any]
    to_rules: dict[str, Any]
    changed_paths: list[str]


class PublicInviteResponse(BaseModel):
    project_id: UUID
    brand_name: str
    project_type: str
    client_name: str
    invite_id: UUID


class DraftUpsert(BaseModel):
    rules: dict[str, Any]
