from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.db import get_db
from app.core.config import get_settings
from app.dependencies import get_current_user
from app.models.user import User
from app.services import auth_service
from app.services.notification_service import _send_email
from app.schemas.auth import LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, UserResponse
from app.schemas.common import err

router = APIRouter()
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await auth_service.authenticate_user(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=err("invalid_credentials", "Invalid email or password"))
    token = auth_service.issue_access_token(user)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=not settings.is_development,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    return UserResponse.model_validate(user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    token = await auth_service.create_password_reset_token(db, body.email)
    if token:
        reset_url = f"{settings.frontend_url}/reset-password?token={token}"
        await _send_email(body.email, "Reset your password", f"Reset link (valid 1 hour):\n{reset_url}")
    # Always return 200 to avoid email enumeration
    return {"ok": True}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail=err("weak_password", "Password must be at least 8 characters"))
    ok = await auth_service.reset_password(db, body.token, body.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail=err("invalid_token", "Token is invalid or expired"))
    return {"ok": True}
