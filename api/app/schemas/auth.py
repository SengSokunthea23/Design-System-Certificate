from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from uuid import UUID
from datetime import datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = ""

    def __init__(self, **data):
        super().__init__(**data)
        if len(self.new_password) < 8:
            raise ValueError("Password must be at least 8 characters")


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}
