import pytest


@pytest.mark.asyncio
async def test_register(client):
    r = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "org_name": "Test Corp"
    })
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    body = {"email": "dup@example.com", "password": "pass123", "org_name": "A"}
    await client.post("/api/v1/auth/register", json=body)
    r = await client.post("/api/v1/auth/register", json=body)
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login@example.com", "password": "pass123", "org_name": "X"
    })
    r = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com", "password": "pass123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrong@example.com", "password": "pass123", "org_name": "Y"
    })
    r = await client.post("/api/v1/auth/login", json={
        "email": "wrong@example.com", "password": "WRONG"
    })
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me(client):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "me@example.com", "password": "pass123", "org_name": "Z"
    })
    token = reg.json()["access_token"]
    r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@example.com"
