"""
Phase 1 smoke test — /health endpoint.
Uses the shared session-scoped app from conftest.py.
"""

import pytest
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


async def test_health_returns_ok(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "amaanitvam-ai-service"


async def test_unknown_route_returns_404(client: AsyncClient):
    response = await client.get("/api/does-not-exist")
    assert response.status_code == 404
