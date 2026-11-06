import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.main import app
from app.core.db import get_db
from app.models.base import Base
from app.models import *  # noqa: F401,F403 — ensure all models are imported for metadata

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/design_picker_test"

engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db():
    async with TestSession() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db):
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_client(client, db):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    user = User(name="Test Admin", email="testadmin@test.com", password_hash=hash_password("Test1234!"), role=UserRole.admin)
    db.add(user)
    await db.flush()
    r = await client.post("/api/v1/auth/login", json={"email": "testadmin@test.com", "password": "Test1234!"})
    assert r.status_code == 200
    return client
