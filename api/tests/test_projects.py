import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_project(admin_client: AsyncClient):
    r = await admin_client.post("/api/v1/projects", json={
        "client_name": "Test Client",
        "brand_name": "Test Brand",
        "project_type": "website",
        "client_contact": {"email": "client@test.com"},
    })
    assert r.status_code == 201
    data = r.json()
    assert data["brand_name"] == "Test Brand"
    assert data["status"] == "draft"
    project_id = data["id"]

    r2 = await admin_client.get("/api/v1/projects")
    assert r2.status_code == 200
    items = r2.json()["items"]
    assert any(p["id"] == project_id for p in items)


@pytest.mark.asyncio
async def test_create_invite_and_public_access(admin_client: AsyncClient):
    r = await admin_client.post("/api/v1/projects", json={
        "client_name": "Invite Client",
        "brand_name": "Invite Brand",
        "project_type": "mobile_app",
    })
    project_id = r.json()["id"]

    r2 = await admin_client.post(f"/api/v1/projects/{project_id}/invites", json={"expires_days": 7})
    assert r2.status_code == 201
    token = r2.json()["token"]
    assert token

    r3 = await admin_client.get(f"/api/v1/public/invite/{token}")
    assert r3.status_code == 200
    assert r3.json()["brand_name"] == "Invite Brand"


@pytest.mark.asyncio
async def test_submit_and_approve(admin_client: AsyncClient):
    r = await admin_client.post("/api/v1/projects", json={
        "client_name": "Submit Client",
        "brand_name": "Submit Brand",
        "project_type": "website",
    })
    project_id = r.json()["id"]

    r2 = await admin_client.post(f"/api/v1/projects/{project_id}/invites", json={})
    token = r2.json()["token"]

    rules = {
        "project_info": {"brand_name": "Submit Brand", "project_type": "website"},
        "colors": {"primary": "#2563EB", "secondary": "#7C3AED", "neutral": "#6B7280", "background": "#FFFFFF"},
        "fonts": {"heading": "Inter", "body": "Inter", "languages": ["en"], "scale_ratio": 1.25},
        "shape": {"radius": "soft", "density": "comfortable", "base_unit": 4, "shadow": "subtle", "button_style": "filled"},
        "voice": {"tone": "friendly"},
    }
    r3 = await admin_client.post(f"/api/v1/public/invite/{token}/submit", json={"rules": rules})
    assert r3.status_code == 200
    assert r3.json()["version"] == 1

    r4 = await admin_client.post(f"/api/v1/projects/{project_id}/approve")
    assert r4.status_code == 200

    r5 = await admin_client.get(f"/api/v1/projects/{project_id}/export?format=css")
    assert r5.status_code == 200
    assert "--color-primary" in r5.text

    r6 = await admin_client.get(f"/api/v1/projects/{project_id}/export?format=json")
    assert r6.status_code == 200
    import json
    tokens = json.loads(r6.text)
    assert tokens["color"]["primary"]["$value"] == "#2563EB"
