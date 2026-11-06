from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from app.core.config import get_settings
from app.routers import auth, projects, invites, submissions, presets, public, export

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Design System Picker API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "An unexpected error occurred", "details": None}},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


PREFIX = "/api/v1"
app.include_router(auth.router,        prefix=f"{PREFIX}/auth",        tags=["auth"])
app.include_router(projects.router,    prefix=f"{PREFIX}/projects",    tags=["projects"])
app.include_router(invites.router,     prefix=f"{PREFIX}/projects",    tags=["invites"])
app.include_router(submissions.router, prefix=f"{PREFIX}/projects",    tags=["submissions"])
app.include_router(presets.router,     prefix=f"{PREFIX}/presets",     tags=["presets"])
app.include_router(public.router,      prefix=f"{PREFIX}/public",      tags=["public"])
app.include_router(export.router,      prefix=f"{PREFIX}/projects",    tags=["export"])
