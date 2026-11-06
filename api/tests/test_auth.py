import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, db):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    user = User(name="Auth User", email="auth@test.com", password_hash=hash_password("Pass1234!"), role=UserRole.designer)
    db.add(user)
    await db.flush()

    r = await client.post("/api/v1/auth/login", json={"email": "auth@test.com", "password": "Pass1234!"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "auth@test.com"
    assert "access_token" in r.cookies


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, db):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    user = User(name="Wrong PW", email="wrongpw@test.com", password_hash=hash_password("Real1234!"), role=UserRole.designer)
    db.add(user)
    await db.flush()

    r = await client.post("/api/v1/auth/login", json={"email": "wrongpw@test.com", "password": "Wrong1234!"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    r = await client.get("/api/v1/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, db):
    from app.models.user import User, UserRole
    from app.core.security import hash_password
    user = User(name="Logout User", email="logout@test.com", password_hash=hash_password("Pass1234!"), role=UserRole.designer)
    db.add(user)
    await db.flush()

    await client.post("/api/v1/auth/login", json={"email": "logout@test.com", "password": "Pass1234!"})
    r = await client.post("/api/v1/auth/logout")
    assert r.status_code == 200
    r2 = await client.get("/api/v1/auth/me")
    assert r2.status_code == 401


@pytest.mark.asyncio
async def test_forgot_password_always_200(client: AsyncClient):
    r = await client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert r.status_code == 200
