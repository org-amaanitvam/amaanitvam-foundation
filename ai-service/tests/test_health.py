"""
Phase 1 smoke test — verifies the service starts and /health responds.
No DB or ChromaDB required; both are mocked.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """
    Create a test client with DB init and ChromaDB init mocked out
    so the test doesn't need a real PostgreSQL or ChromaDB instance.
    """
    with (
        patch("app.database.session.init_db", new_callable=AsyncMock),
        patch("app.database.chroma.init_chroma", return_value=None),
    ):
        from main import app
        with TestClient(app) as c:
            yield c


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "amaanitvam-ai-service"


def test_unknown_route_returns_404(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
