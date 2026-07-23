"""
Phase 6 tests — RAG Indexing Pipeline.

All tests mock:
  - chromadb (the collection.upsert / delete calls)
  - google.genai client (the new official Gemini SDK)
  - ai_logs DB writes (verified separately)

Tests run without ChromaDB installed and without a real
Gemini API key — safe for CI.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport

from app.config import settings

SECRET = settings.INTERNAL_SHARED_SECRET
UID = f"phase6_{uuid.uuid4().hex[:8]}"
H = {
    "X-Internal-Secret": SECRET,
    "X-Firebase-UID": UID,
}

# A fake 768-dim embedding vector (Gemini text-embedding-004 dimension)
FAKE_EMBEDDING = [0.01] * 768


@pytest.fixture
async def client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


def _mock_chroma_collection():
    """Return a MagicMock that behaves like a ChromaDB collection."""
    col = MagicMock()
    col.upsert = MagicMock()
    col.delete = MagicMock()
    return col


def _mock_genai_client():
    """
    Return a MagicMock that behaves like a google.genai.Client.
    embed_content returns a result with embeddings[0].values = FAKE_EMBEDDING.
    """
    embedding_obj = MagicMock()
    embedding_obj.values = FAKE_EMBEDDING

    result = MagicMock()
    result.embeddings = [embedding_obj]

    client_mock = MagicMock()
    client_mock.models.embed_content.return_value = result
    return client_mock


# ── Course indexing ─────────────────────────────────────────────────────

async def test_index_course_success(client: AsyncClient):
    """POST /internal/index-course/:id with valid data → 200, indexed=True."""
    mock_col = _mock_chroma_collection()

    with (
        patch("app.services.indexing_service._get_collection", return_value=mock_col),
        patch("app.services.embedding_service._get_client",
              return_value=_mock_genai_client()),
    ):
        resp = await client.post(
            "/internal/index-course/course123",
            json={
                "title": "Introduction to Physics",
                "description": "Basic physics concepts for grade 11.",
                "category": "academic",
                "grade_level": "11",
                "subject": "Physics",
                "module_titles": ["Mechanics", "Thermodynamics", "Optics"],
            },
            headers=H,
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["indexed"] is True
    assert body["data"]["chroma_id"] == "course::course123"
    assert body["data"]["document_length"] > 0

    # Verify upsert was called once with the right ID
    mock_col.upsert.assert_called_once()
    call_kwargs = mock_col.upsert.call_args[1] or {}
    call_args = mock_col.upsert.call_args[0]
    # Check ids contains the right chroma_id (either positional or keyword)
    ids_arg = call_kwargs.get("ids") or (call_args[0] if call_args else None)
    assert ids_arg == ["course::course123"]


async def test_index_course_minimal_fields(client: AsyncClient):
    """POST /internal/index-course/:id with only title → 200."""
    mock_col = _mock_chroma_collection()

    with (
        patch("app.services.indexing_service._get_collection", return_value=mock_col),
        patch("app.services.embedding_service._get_client",
              return_value=_mock_genai_client()),
    ):
        resp = await client.post(
            "/internal/index-course/course456",
            json={"title": "Algebra Basics"},
            headers=H,
        )

    assert resp.status_code == 200
    assert resp.json()["data"]["indexed"] is True


async def test_index_course_chroma_unavailable(client: AsyncClient):
    """POST /internal/index-course/:id when ChromaDB not installed → 503."""
    from app.services.indexing_service import IndexingUnavailableError

    with patch(
        "app.services.indexing_service._get_collection",
        side_effect=IndexingUnavailableError("chromadb not installed"),
    ):
        resp = await client.post(
            "/internal/index-course/course789",
            json={"title": "Test Course"},
            headers=H,
        )

    assert resp.status_code == 503
    assert resp.json()["detail"]["error"]["code"] == "CHROMA_UNAVAILABLE"


async def test_delete_course_index_success(client: AsyncClient):
    """DELETE /internal/index-course/:id → 200, deleted=True."""
    mock_col = _mock_chroma_collection()

    with patch("app.services.indexing_service._get_collection", return_value=mock_col):
        resp = await client.delete(
            "/internal/index-course/course123",
            headers=H,
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["deleted"] is True
    assert body["data"]["chroma_id"] == "course::course123"
    mock_col.delete.assert_called_once()


# ── Resource indexing ───────────────────────────────────────────────────

async def test_index_resource_success(client: AsyncClient):
    """POST /internal/index-resource/:id with valid data → 200, indexed=True."""
    mock_col = _mock_chroma_collection()

    with (
        patch("app.services.indexing_service._get_collection", return_value=mock_col),
        patch("app.services.embedding_service._get_client",
              return_value=_mock_genai_client()),
    ):
        resp = await client.post(
            "/internal/index-resource/res001",
            json={
                "title": "NCERT Physics Part 1 Grade 11",
                "description": "Official NCERT textbook for physics.",
                "category": "textbook",
                "subject": "Physics",
                "domain": "science",
                "grade": "11",
                "resource_type": "pdf",
            },
            headers=H,
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["indexed"] is True
    assert body["data"]["chroma_id"] == "resource::res001"


async def test_index_resource_chroma_unavailable(client: AsyncClient):
    """POST /internal/index-resource/:id when ChromaDB not installed → 503."""
    from app.services.indexing_service import IndexingUnavailableError

    with patch(
        "app.services.indexing_service._get_collection",
        side_effect=IndexingUnavailableError("chromadb not installed"),
    ):
        resp = await client.post(
            "/internal/index-resource/res999",
            json={"title": "Test Resource"},
            headers=H,
        )

    assert resp.status_code == 503


async def test_delete_resource_index_success(client: AsyncClient):
    """DELETE /internal/index-resource/:id → 200, deleted=True."""
    mock_col = _mock_chroma_collection()

    with patch("app.services.indexing_service._get_collection", return_value=mock_col):
        resp = await client.delete("/internal/index-resource/res001", headers=H)

    assert resp.status_code == 200
    assert resp.json()["data"]["deleted"] is True


# ── Auth boundary ───────────────────────────────────────────────────────

async def test_index_without_secret_rejected(client: AsyncClient):
    """Indexing endpoints reject requests without X-Internal-Secret."""
    resp = await client.post(
        "/internal/index-course/course123",
        json={"title": "Test"},
        headers={"X-Firebase-UID": UID},
    )
    assert resp.status_code in (403, 422)


# ── Text builder unit tests ─────────────────────────────────────────────

def test_build_course_document_includes_all_fields():
    """_build_course_document should include title, subject, modules."""
    from app.services.indexing_service import _build_course_document
    from app.schemas.indexing import IndexCourseRequest

    data = IndexCourseRequest(
        title="Chemistry Grade 12",
        description="Organic and inorganic chemistry.",
        subject="Chemistry",
        grade_level="12",
        category="academic",
        module_titles=["Organic Chemistry", "Electrochemistry"],
    )
    doc = _build_course_document("chem12", data)

    assert "Chemistry Grade 12" in doc
    assert "Organic Chemistry" in doc
    assert "Electrochemistry" in doc
    assert "Chemistry" in doc
    assert "12" in doc


def test_build_resource_document_includes_all_fields():
    """_build_resource_document should include title, type, domain."""
    from app.services.indexing_service import _build_resource_document
    from app.schemas.indexing import IndexResourceRequest

    data = IndexResourceRequest(
        title="JEE Advanced Maths Notes",
        subject="Mathematics",
        domain="engineering",
        grade="12",
        resource_type="pdf",
        category="notes",
    )
    doc = _build_resource_document("jee_maths", data)

    assert "JEE Advanced Maths Notes" in doc
    assert "pdf" in doc
    assert "engineering" in doc


# ── Internal health now reports Chroma status ───────────────────────────

async def test_internal_health_reports_chroma_unavailable(client: AsyncClient):
    """With ChromaDB not installed, /internal/health should say 'unavailable'."""
    with patch("app.database.chroma.is_available", return_value=False):
        resp = await client.get(
            "/internal/health",
            headers={"X-Internal-Secret": SECRET},
        )
    assert resp.status_code == 200
    assert "unavailable" in resp.json()["chroma"]
