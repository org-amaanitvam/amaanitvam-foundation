"""
Phase 7 tests — Chat Logic (permission-gated RAG + Gemini).

All external calls are mocked:
  - rag_service.retrieve_context (mocks both permission_service + ChromaDB)
  - llm_service.generate_response (mocks Gemini)

PostgreSQL IS used for message/conversation persistence.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select, delete

from app.config import settings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.ai_notification import AINotification

# ── Constants ─────────────────────────────────────────────────────────
SECRET = settings.INTERNAL_SHARED_SECRET
_UID = f"p7_{uuid.uuid4().hex[:10]}"
H = {"X-Internal-Secret": SECRET}

FAKE_AI_TEXT = "Great question! Here is a clear explanation of Newton's first law..."
FAKE_CHUNKS = ["An object at rest stays at rest unless acted upon by a force."]


# ── Fixtures ───────────────────────────────────────────────────────────

@pytest.fixture
async def client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture(scope="module", autouse=True)
async def cleanup(TestSessionLocal):
    yield
    async with TestSessionLocal() as s:
        await s.execute(
            delete(Message).where(
                Message.conversation_id.in_(
                    select(Conversation.id).where(
                        Conversation.firebase_uid.like("p7_%")
                    )
                )
            )
        )
        await s.execute(
            delete(Conversation).where(Conversation.firebase_uid.like("p7_%"))
        )
        await s.execute(
            delete(AINotification).where(AINotification.firebase_uid.like("p7_%"))
        )
        await s.commit()


# ── Helper to mock the two service boundaries ─────────────────────────

def _mock_rag(chunks=None):
    """Mock rag_service.retrieve_context to return pre-canned chunks."""
    return patch(
        "app.services.chat_service.rag_service.retrieve_context",
        new=AsyncMock(return_value=chunks if chunks is not None else FAKE_CHUNKS),
    )


def _mock_llm(text=FAKE_AI_TEXT, token_count=128, latency_ms=250):
    """Mock llm_service.generate_response to return pre-canned response."""
    return patch(
        "app.services.chat_service.generate_response",
        new=AsyncMock(return_value=(text, token_count, latency_ms)),
    )


# ── Core chat tests ────────────────────────────────────────────────────

async def test_chat_creates_new_conversation(client: AsyncClient):
    """POST /internal/chat without conversation_id → creates a new conversation."""
    with _mock_rag(), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={
                "firebase_uid": _UID,
                "message": "What is Newton's first law?",
                "context_type": "general",
            },
            headers=H,
        )

    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["role"] == "assistant"
    assert body["data"]["content"] == FAKE_AI_TEXT
    assert body["data"]["model_used"] == "gemini-1.5-flash"
    assert "conversation_id" in body


async def test_chat_uses_existing_conversation(client: AsyncClient):
    """POST /internal/chat with conversation_id → appends to that conversation."""
    with _mock_rag(), _mock_llm():
        r1 = await client.post(
            "/internal/chat",
            json={"firebase_uid": _UID, "message": "Hello AI!", "context_type": "general"},
            headers=H,
        )
    conv_id = r1.json()["conversation_id"]

    with _mock_rag(), _mock_llm("Follow-up answer."):
        r2 = await client.post(
            "/internal/chat",
            json={
                "firebase_uid": _UID,
                "conversation_id": conv_id,
                "message": "Can you explain more?",
                "context_type": "general",
            },
            headers=H,
        )

    assert r2.status_code == 200
    assert r2.json()["conversation_id"] == conv_id
    assert r2.json()["data"]["content"] == "Follow-up answer."


async def test_chat_rag_called_with_correct_args(client: AsyncClient):
    """rag_service.retrieve_context should be called with the correct firebase_uid and context args."""
    mock_rag = AsyncMock(return_value=FAKE_CHUNKS)

    with (
        patch("app.services.chat_service.rag_service.retrieve_context", new=mock_rag),
        _mock_llm(),
    ):
        await client.post(
            "/internal/chat",
            json={
                "firebase_uid": _UID,
                "message": "Explain kinematics",
                "context_type": "course",
                "context_id": "physics_course_abc",
            },
            headers=H,
        )

    mock_rag.assert_called_once()
    call_kwargs = mock_rag.call_args[1] if mock_rag.call_args[1] else {}
    call_args = mock_rag.call_args[0]
    # firebase_uid must be forwarded so rag_service can permission-gate
    assert _UID in (call_args + tuple(call_kwargs.values()))
    assert "physics_course_abc" in (call_args + tuple(call_kwargs.values()))


async def test_chat_graceful_with_empty_rag(client: AsyncClient):
    """Chat still works when RAG returns no chunks (permission denied / no enrolment)."""
    with _mock_rag(chunks=[]), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={"firebase_uid": _UID, "message": "What is photosynthesis?", "context_type": "general"},
            headers=H,
        )

    assert resp.status_code == 200
    assert resp.json()["data"]["role"] == "assistant"


async def test_chat_gemini_failure_returns_503(client: AsyncClient):
    """If llm_service raises LLMError, the endpoint returns 503."""
    from app.services.llm_service import LLMError

    with (
        _mock_rag(chunks=[]),
        patch(
            "app.services.chat_service.generate_response",
            new=AsyncMock(side_effect=LLMError("API key invalid")),
        ),
    ):
        resp = await client.post(
            "/internal/chat",
            json={"firebase_uid": _UID, "message": "Test question", "context_type": "general"},
            headers=H,
        )

    assert resp.status_code == 503
    assert resp.json()["detail"]["error"]["code"] == "LLM_UNAVAILABLE"


async def test_chat_nonexistent_conversation_returns_404(client: AsyncClient):
    """Providing a non-existent conversation_id returns 404."""
    with _mock_rag(chunks=[]), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={
                "firebase_uid": _UID,
                "conversation_id": str(uuid.uuid4()),
                "message": "Hello?",
                "context_type": "general",
            },
            headers=H,
        )

    assert resp.status_code == 404
    assert resp.json()["detail"]["error"]["code"] == "CONVERSATION_NOT_FOUND"


async def test_chat_other_users_conversation_returns_404(client: AsyncClient):
    """User B cannot send messages to User A's conversation."""
    uid_a = f"p7_user_a_{uuid.uuid4().hex[:6]}"
    uid_b = f"p7_user_b_{uuid.uuid4().hex[:6]}"

    with _mock_rag(), _mock_llm():
        r = await client.post(
            "/internal/chat",
            json={"firebase_uid": uid_a, "message": "Private", "context_type": "general"},
            headers=H,
        )
    conv_id = r.json()["conversation_id"]

    with _mock_rag(chunks=[]), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={
                "firebase_uid": uid_b,
                "conversation_id": conv_id,
                "message": "Can I see this?",
                "context_type": "general",
            },
            headers=H,
        )

    assert resp.status_code == 404


async def test_chat_saves_notification(client: AsyncClient, TestSessionLocal):
    """After a chat, an AINotification is created for the user."""
    uid = f"p7_notif_{uuid.uuid4().hex[:6]}"

    with _mock_rag(), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={"firebase_uid": uid, "message": "Test for notification", "context_type": "general"},
            headers=H,
        )

    assert resp.status_code == 200
    async with TestSessionLocal() as s:
        result = await s.execute(
            select(AINotification).where(AINotification.firebase_uid == uid)
        )
        notifications = result.scalars().all()
    assert len(notifications) == 1
    assert notifications[0].type == "ai_response"
    assert not notifications[0].is_read


async def test_chat_conversation_title_backfilled(client: AsyncClient, TestSessionLocal):
    """First message backfills the conversation title."""
    uid = f"p7_title_{uuid.uuid4().hex[:6]}"

    with _mock_rag(), _mock_llm():
        resp = await client.post(
            "/internal/chat",
            json={"firebase_uid": uid, "message": "Explain thermodynamics", "context_type": "general"},
            headers=H,
        )

    conv_id = resp.json()["conversation_id"]
    async with TestSessionLocal() as s:
        result = await s.execute(
            select(Conversation).where(Conversation.id == uuid.UUID(conv_id))
        )
        conv = result.scalar_one()
    assert conv.title is not None
    assert "thermodynamics" in conv.title.lower()


async def test_chat_missing_secret_rejected(client: AsyncClient):
    """POST /internal/chat without X-Internal-Secret → 403."""
    resp = await client.post(
        "/internal/chat",
        json={"firebase_uid": _UID, "message": "Test", "context_type": "general"},
    )
    assert resp.status_code in (403, 422)


async def test_chat_empty_message_rejected(client: AsyncClient):
    """Blank message content → 422 validation error."""
    resp = await client.post(
        "/internal/chat",
        json={"firebase_uid": _UID, "message": "   ", "context_type": "general"},
        headers=H,
    )
    assert resp.status_code == 422


async def test_rate_limiter_blocks_after_30_messages(client: AsyncClient):
    """The 31st message from the same user within 1 minute → 429."""
    from app.middleware.rate_limiter import _store
    import time

    uid = f"p7_ratelimit_{uuid.uuid4().hex[:6]}"
    _store[uid].extend([time.monotonic() for _ in range(30)])

    resp = await client.post(
        "/internal/chat",
        json={"firebase_uid": uid, "message": "One more", "context_type": "general"},
        headers=H,
    )
    assert resp.status_code == 429
    assert resp.json()["detail"]["error"]["code"] == "RATE_LIMIT_EXCEEDED"
