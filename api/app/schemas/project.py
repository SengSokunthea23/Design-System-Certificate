from datetime import date, datetime
from uuid import UUID
from typing import Any
from pydantic import BaseModel, EmailStr
from app.models.project import ProjectStatus, ProjectType


class ClientContact(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    telegram: str | None = None


class ProjectCreate(BaseModel):
    client_name: str
    client_contact: ClientContact = ClientContact()
    brand_name: str
    project_type: ProjectType
    deadline: date | None = None
    internal_notes: str | None = None


class ProjectUpdate(BaseModel):
    client_name: str | None = None
    client_contact: ClientContact | None = None
    brand_name: str | None = None
    project_type: ProjectType | None = None
    deadline: date | None = None
    internal_notes: str | None = None
    status: ProjectStatus | None = None


class ProjectResponse(BaseModel):
    id: UUID
    owner_id: UUID
    client_name: str
    client_contact: dict[str, Any]
    brand_name: str
    project_type: ProjectType
    status: ProjectStatus
    deadline: date | None
    internal_notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
