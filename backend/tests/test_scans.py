import pytest


async def _register_and_token(client, email="scan@example.com"):
    r = await client.post("/api/v1/auth/register", json={
        "email": email, "password": "pass123", "org_name": "ScanOrg"
    })
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_create_scan_demo(client):
    token = await _register_and_token(client)
    r = await client.post(
        "/api/v1/scans/",
        json={"product": "finops", "demo_mode": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["product"] == "finops"
    assert data["status"] in ("pending", "running", "completed")


@pytest.mark.asyncio
async def test_create_scan_invalid_product(client):
    token = await _register_and_token(client, "inv@example.com")
    r = await client.post(
        "/api/v1/scans/",
        json={"product": "invalid_product", "demo_mode": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_list_scans(client):
    token = await _register_and_token(client, "list@example.com")
    await client.post(
        "/api/v1/scans/",
        json={"product": "cloudguard", "demo_mode": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    r = await client.get("/api/v1/scans/", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_get_scan(client):
    token = await _register_and_token(client, "get@example.com")
    create_r = await client.post(
        "/api/v1/scans/",
        json={"product": "finops", "demo_mode": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    scan_id = create_r.json()["id"]
    r = await client.get(f"/api/v1/scans/{scan_id}", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["id"] == scan_id
