"""
Tests for permission_service, rag_service, and indexing chunking.

These are unit tests — no real HTTP or ChromaDB calls are made.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx


# ── permission_service tests ───────────────────────────────────────────

async def test_permission_service_returns_parsed_data():
    """Successful Node.js response → parsed dict with all keys."""
    from app.services.permission_service import get_user_permissions

    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {
        "role": "student",
        "enrolled_course_ids": ["course_abc", "course_xyz"],
        "accessible_resource_ids": ["res_001"],
    }

    with patch("app.services.permission_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_cls.return_value = mock_client

        result = await get_user_permissions("user123")

    assert result["role"] == "student"
    assert "course_abc" in result["enrolled_course_ids"]
    assert "res_001" in result["accessible_resource_ids"]


async def test_permission_service_normalises_missing_fields():
    """If Node.js omits lists, they default to empty lists."""
    from app.services.permission_service import get_user_permissions

    mock_response = MagicMock()
    mock_response.raise_for_status = MagicMock()
    mock_response.json.return_value = {"role": "teacher"}  # no lists

    with patch("app.services.permission_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_cls.return_value = mock_client

        result = await get_user_permissions("teacher_uid")

    assert result["enrolled_course_ids"] == []
    assert result["accessible_resource_ids"] == []


async def test_permission_service_raises_on_timeout():
    """Timeout → PermissionServiceError."""
    from app.services.permission_service import get_user_permissions, PermissionServiceError

    with patch("app.services.permission_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.get = AsyncMock(side_effect=httpx.TimeoutException("timed out"))
        mock_client_cls.return_value = mock_client

        with pytest.raises(PermissionServiceError, match="timed out"):
            await get_user_permissions("slow_user")


async def test_permission_service_raises_on_http_error():
    """HTTP 500 from Node.js → PermissionServiceError."""
    from app.services.permission_service import get_user_permissions, PermissionServiceError

    mock_response = MagicMock()
    mock_response.status_code = 500
    http_error = httpx.HTTPStatusError("server error", request=MagicMock(), response=mock_response)

    with patch("app.services.permission_service.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        mock_client.get = AsyncMock(side_effect=http_error)
        mock_client_cls.return_value = mock_client

        with pytest.raises(PermissionServiceError, match="500"):
            await get_user_permissions("user123")


# ── rag_service tests ──────────────────────────────────────────────────

async def test_rag_returns_empty_when_permission_service_fails():
    """If permission service is down, RAG returns [] (no content leak)."""
    from app.services.rag_service import retrieve_context
    from app.services.permission_service import PermissionServiceError

    with patch(
        "app.services.rag_service.get_user_permissions",
        new=AsyncMock(side_effect=PermissionServiceError("timeout")),
    ):
        result = await retrieve_context("What is force?", "user_abc")

    assert result == []


async def test_rag_returns_empty_when_no_enrolments():
    """User with no enrolled courses → [] (nothing to search)."""
    from app.services.rag_service import retrieve_context

    with patch(
        "app.services.rag_service.get_user_permissions",
        new=AsyncMock(return_value={
            "role": "student",
            "enrolled_course_ids": [],
            "accessible_resource_ids": [],
        }),
    ):
        result = await retrieve_context("What is gravity?", "new_user")

    assert result == []


async def test_rag_filters_by_source_id_in():
    """User with enrolled courses → ChromaDB queried with $in filter."""
    from app.services.rag_service import retrieve_context

    mock_col = MagicMock()
    mock_col.query.return_value = {"documents": [["Force = mass x acceleration"]]}

    embed_obj = MagicMock()
    embed_obj.values = [0.1] * 768
    embed_result = MagicMock()
    embed_result.embeddings = [embed_obj]
    mock_genai = MagicMock()
    mock_genai.models.embed_content.return_value = embed_result

    with (
        patch(
            "app.services.rag_service.get_user_permissions",
            new=AsyncMock(return_value={
                "role": "student",
                "enrolled_course_ids": ["physics_101", "math_202"],
                "accessible_resource_ids": [],
            }),
        ),
        patch("app.database.chroma.get_collection", return_value=mock_col),
        patch("app.services.embedding_service._get_client", return_value=mock_genai),
    ):
        result = await retrieve_context("What is force?", "user_xyz")

    assert result == ["Force = mass x acceleration"]
    call_kwargs = mock_col.query.call_args[1]
    where = call_kwargs.get("where", {})
    assert "$in" in str(where) or "$eq" in str(where)


async def test_rag_blocks_access_to_non_enrolled_course():
    """User requests context for a course they're not enrolled in → []."""
    from app.services.rag_service import retrieve_context

    with patch(
        "app.services.rag_service.get_user_permissions",
        new=AsyncMock(return_value={
            "role": "student",
            "enrolled_course_ids": ["physics_101"],
            "accessible_resource_ids": [],
        }),
    ):
        result = await retrieve_context(
            "What is organic chemistry?",
            "user_xyz",
            context_type="course",
            context_id="chemistry_999",  # NOT in enrolled list
        )

    assert result == []


async def test_rag_scopes_to_specific_course_when_enrolled():
    """User requests context for a course they ARE enrolled in → $eq filter."""
    from app.services.rag_service import retrieve_context

    mock_col = MagicMock()
    mock_col.query.return_value = {"documents": [["Kinematics: motion without force"]]}

    embed_obj = MagicMock()
    embed_obj.values = [0.1] * 768
    embed_result = MagicMock()
    embed_result.embeddings = [embed_obj]
    mock_genai = MagicMock()
    mock_genai.models.embed_content.return_value = embed_result

    with (
        patch(
            "app.services.rag_service.get_user_permissions",
            new=AsyncMock(return_value={
                "role": "student",
                "enrolled_course_ids": ["physics_101"],
                "accessible_resource_ids": [],
            }),
        ),
        patch("app.database.chroma.get_collection", return_value=mock_col),
        patch("app.services.embedding_service._get_client", return_value=mock_genai),
    ):
        result = await retrieve_context(
            "Explain kinematics",
            "user_xyz",
            context_type="course",
            context_id="physics_101",
        )

    assert result == ["Kinematics: motion without force"]
    where = mock_col.query.call_args[1].get("where", {})
    assert where == {"source_id": {"$eq": "physics_101"}}


# ── chunk_text unit tests ──────────────────────────────────────────────

def test_chunk_text_short_text_returns_single_chunk():
    """Text shorter than chunk_size → single chunk."""
    from app.services.indexing_service import chunk_text

    text = "Short text that fits in one chunk."
    chunks = chunk_text(text, chunk_size=2000)
    assert chunks == [text]


def test_chunk_text_long_text_produces_multiple_chunks():
    """Text longer than chunk_size → multiple overlapping chunks."""
    from app.services.indexing_service import chunk_text

    # 3x chunk_size worth of text
    text = "word " * 1200  # 6000 chars
    chunks = chunk_text(text, chunk_size=2000, overlap=200)
    assert len(chunks) > 1
    # Each chunk should be at most chunk_size chars
    for chunk in chunks:
        assert len(chunk) <= 2000


def test_chunk_text_overlap_means_first_words_of_chunk2_appear_in_chunk1_tail():
    """Chunks should overlap — end of chunk N contains beginning of chunk N+1."""
    from app.services.indexing_service import chunk_text

    # 4000 chars → 2 chunks with 200 char overlap
    text = "alpha " * 700  # 4200 chars
    chunks = chunk_text(text, chunk_size=2000, overlap=200)
    assert len(chunks) >= 2
    # The tail of chunk 0 should overlap with the head of chunk 1
    tail_of_first = chunks[0][-200:]
    head_of_second = chunks[1][:200]
    # They should share some content (overlap)
    assert len(set(tail_of_first.split()) & set(head_of_second.split())) > 0


def test_chunk_text_empty_string_returns_empty():
    from app.services.indexing_service import chunk_text
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_indexing_service_response_includes_chunks_key():
    """index_course response should include 'chunks' count (new field)."""
    # This is tested via the API in test_indexing.py which mocks collection.
    # Here we just verify the text builder includes content_blocks.
    from app.services.indexing_service import _build_course_document
    from app.schemas.indexing import IndexCourseRequest

    data = IndexCourseRequest(
        title="Physics 101",
        content_blocks=["Lesson 1: Kinematics", "Lesson 2: Dynamics"],
    )
    doc = _build_course_document("c1", data)
    assert "Kinematics" in doc
    assert "Dynamics" in doc
