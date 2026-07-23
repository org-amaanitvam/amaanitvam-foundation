"""
Phase 5 integration tests — Conversations & Notifications CRUD.

Uses real PostgreSQL with a unique firebase_uid prefix per pytest session.
All rows are cleaned up in the module-scoped teardown fixture.
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import delete, select as sa_select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.ai_notification import AINotification

# ── Constants ─────────────────────────────────────────────────────────

SECRET = settings.INTERNAL_SHARED_SECRET
# Unique per test run so parallel CI runs never collide
_UID = f"p5_{uuid.uuid4().hex[:10]}"
H = {"X-Internal-Secret": SECRET, "X-Firebase-UID": _UID}  # shorthand


# ── Module-scoped cleanup (runs once after ALL tests in this file) ────

@pytest.fixture(scope="module", autouse=True)
async def cleanup(TestSessionLocal):
    yield
    async with TestSessionLocal() as s:
        await s.execute(
            delete(Message).where(
                Message.conversation_id.in_(
                    sa_select(Conversation.id).where(
                        Conversation.firebase_uid.like(f"p5_%")
                    )
                )
            )
        )
        await s.execute(delete(Conversation).where(Conversation.firebase_uid.like("p5_%")))
        await s.execute(delete(AINotification).where(AINotification.firebase_uid.like("p5_%")))
        await s.commit()


# ── Per-test HTTP client ───────────────────────────────────────────────

@pytest.fixture
async def client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


# ══ Conversation tests ════════════════════════════════════════════════

async def test_create_conversation_general(client: AsyncClient):
    resp = await client.post("/api/conversations", json={"context_type": "general"}, headers=H)
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["context_type"] == "general"
    assert data["is_archived"] is False
    assert data["message_count"] == 0
    assert "id" in data


async def test_create_conversation_course_context(client: AsyncClient):
    resp = await client.post(
        "/api/conversations",
        json={"context_type": "course", "context_id": "mongo_abc123"},
        headers=H,
    )
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["context_type"] == "course"
    assert data["context_id"] == "mongo_abc123"


async def test_list_conversations_empty(client: AsyncClient):
    uid2 = f"p5_empty_{uuid.uuid4().hex[:6]}"
    resp = await client.get(
        "/api/conversations",
        headers={"X-Internal-Secret": SECRET, "X-Firebase-UID": uid2},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"] == []
    assert body["meta"]["total"] == 0


async def test_list_conversations_returns_data(client: AsyncClient):
    for _ in range(2):
        await client.post("/api/conversations", json={"context_type": "general"}, headers=H)

    resp = await client.get("/api/conversations", headers=H)
    assert resp.status_code == 200
    body = resp.json()
    assert body["meta"]["total"] >= 2


async def test_get_conversation_not_found(client: AsyncClient):
    resp = await client.get(f"/api/conversations/{uuid.uuid4()}", headers=H)
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "CONVERSATION_NOT_FOUND"


async def test_get_conversation_found(client: AsyncClient):
    create = await client.post("/api/conversations", json={"context_type": "general"}, headers=H)
    conv_id = create.json()["data"]["id"]

    resp = await client.get(f"/api/conversations/{conv_id}", headers=H)
    assert resp.status_code == 200
    assert resp.json()["data"]["id"] == conv_id


async def test_archive_conversation(client: AsyncClient):
    create = await client.post("/api/conversations", json={"context_type": "general"}, headers=H)
    conv_id = create.json()["data"]["id"]

    archive = await client.patch(f"/api/conversations/{conv_id}/archive", headers=H)
    assert archive.status_code == 200
    assert archive.json()["data"]["is_archived"] is True

    # Should NOT appear in the default (non-archived) list
    list_resp = await client.get("/api/conversations", headers=H)
    ids = [c["id"] for c in list_resp.json()["data"]]
    assert conv_id not in ids


async def test_archive_nonexistent_conversation(client: AsyncClient):
    resp = await client.patch(f"/api/conversations/{uuid.uuid4()}/archive", headers=H)
    assert resp.status_code == 404


async def test_list_messages_empty(client: AsyncClient):
    create = await client.post("/api/conversations", json={"context_type": "general"}, headers=H)
    conv_id = create.json()["data"]["id"]

    resp = await client.get(f"/api/conversations/{conv_id}/messages", headers=H)
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"] == []
    assert body["meta"]["total"] == 0
    assert body["meta"]["page"] == 1


async def test_list_messages_nonexistent_conversation(client: AsyncClient):
    resp = await client.get(f"/api/conversations/{uuid.uuid4()}/messages", headers=H)
    assert resp.status_code == 404


async def test_missing_secret_rejected(client: AsyncClient):
    resp = await client.get("/api/conversations", headers={"X-Firebase-UID": _UID})
    assert resp.status_code in (403, 422)


async def test_missing_firebase_uid_rejected(client: AsyncClient):
    resp = await client.get("/api/conversations", headers={"X-Internal-Secret": SECRET})
    assert resp.status_code == 422


# ══ Notification tests ════════════════════════════════════════════════

async def test_list_notifications_empty(client: AsyncClient):
    uid2 = f"p5_notif_{uuid.uuid4().hex[:8]}"
    resp = await client.get(
        "/api/ai-notifications",
        headers={"X-Internal-Secret": SECRET, "X-Firebase-UID": uid2},
    )
    assert resp.status_code == 200
    assert resp.json()["data"] == []
    assert resp.json()["meta"]["total"] == 0


async def test_mark_notification_read_not_found(client: AsyncClient):
    resp = await client.patch(f"/api/ai-notifications/{uuid.uuid4()}/read", headers=H)
    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "NOTIFICATION_NOT_FOUND"


async def test_mark_all_notifications_read_empty(client: AsyncClient):
    uid2 = f"p5_readall_{uuid.uuid4().hex[:6]}"
    resp = await client.patch(
        "/api/ai-notifications/read-all",
        headers={"X-Internal-Secret": SECRET, "X-Firebase-UID": uid2},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["updated_count"] == 0


async def test_pagination_params(client: AsyncClient):
    """Pagination query params are accepted and reflected in meta."""
    resp = await client.get("/api/conversations?page=2&limit=5", headers=H)
    assert resp.status_code == 200
    meta = resp.json()["meta"]
    assert meta["page"] == 2
    assert meta["limit"] == 5
