"""
Phase 4 tests — Internal auth middleware + rate limiter.
All tests mock DB and ChromaDB so no infrastructure needed.
"""

import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.config import settings


@pytest.fixture
def client():
    with (
        patch("app.database.session.init_db", new_callable=AsyncMock),
        patch("app.database.chroma.init_chroma", return_value=None),
    ):
        from main import app
        with TestClient(app) as c:
            yield c


# ── Internal auth tests ───────────────────────────────────────────────

def test_internal_health_without_secret_returns_403(client):
    """No X-Internal-Secret header → must be rejected."""
    response = client.get("/internal/health")
    assert response.status_code == 422  # FastAPI rejects missing required header


def test_internal_health_with_wrong_secret_returns_403(client):
    """Wrong secret → 403 with INTERNAL_SECRET_INVALID code."""
    response = client.get(
        "/internal/health",
        headers={"X-Internal-Secret": "totally_wrong_secret"},
    )
    assert response.status_code == 403
    body = response.json()
    assert body["detail"]["success"] is False
    assert body["detail"]["error"]["code"] == "INTERNAL_SECRET_INVALID"


def test_internal_health_with_correct_secret_returns_200(client):
    """Correct secret → 200 with status ok."""
    response = client.get(
        "/internal/health",
        headers={"X-Internal-Secret": settings.INTERNAL_SHARED_SECRET},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


# ── Rate limiter tests ────────────────────────────────────────────────

def test_rate_limiter_allows_under_limit():
    """Under 30 messages/min — should not be rate limited."""
    from app.middleware.rate_limiter import _is_rate_limited, _store

    uid = "test_user_under_limit"
    _store.pop(uid, None)  # clean slate

    for i in range(29):
        assert _is_rate_limited(uid) is False, f"Should not be limited at message {i+1}"


def test_rate_limiter_blocks_at_limit():
    """At exactly 30 messages — the 31st should be blocked."""
    from app.middleware.rate_limiter import _is_rate_limited, _store

    uid = "test_user_at_limit"
    _store.pop(uid, None)  # clean slate

    for _ in range(30):
        _is_rate_limited(uid)  # fill the window

    assert _is_rate_limited(uid) is True, "31st message should be rate limited"


def test_rate_limiter_isolates_users():
    """Rate limit for one user must not affect another."""
    from app.middleware.rate_limiter import _is_rate_limited, _store

    uid_a = "isolated_user_a"
    uid_b = "isolated_user_b"
    _store.pop(uid_a, None)
    _store.pop(uid_b, None)

    for _ in range(30):
        _is_rate_limited(uid_a)

    assert _is_rate_limited(uid_a) is True
    assert _is_rate_limited(uid_b) is False, "User B should not be affected"
