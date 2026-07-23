"""
Indexing service — orchestrates RAG document indexing into ChromaDB.

Called by the /internal/index-* endpoints when Node.js notifies us that
a course or library resource has been created or updated.

Flow:
  1. Build a plain-text document from the structured request fields
  2. Call embedding_service.embed_text() → 768-dim vector (Gemini)
  3. Upsert the vector into ChromaDB (idempotent — safe to re-call on update)
  4. Log the event to ai_logs table

Graceful degradation:
  If ChromaDB is not installed (Phase 1-5 local dev), logs a warning and
  raises IndexingUnavailableError. The route returns HTTP 503.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_log import AILog
from app.services.embedding_service import EmbeddingError, embed_text
from app.schemas.indexing import IndexCourseRequest, IndexResourceRequest

logger = logging.getLogger("ai_service")

# ── Collection name constants ─────────────────────────────────────────
COLLECTION_NAME = "learning_content"


class IndexingUnavailableError(Exception):
    """Raised when ChromaDB is not installed / not initialised."""


class IndexingError(Exception):
    """Raised when indexing fails for a non-infrastructure reason."""


# ── Text builders ─────────────────────────────────────────────────────

def _build_course_document(course_id: str, data: IndexCourseRequest) -> str:
    """
    Convert a course's structured fields into a single text document
    that captures its semantic meaning for embedding.
    """
    parts = [f"Course: {data.title}"]
    if data.category:
        parts.append(f"Category: {data.category}")
    if data.grade_level:
        parts.append(f"Grade level: {data.grade_level}")
    if data.subject:
        parts.append(f"Subject: {data.subject}")
    if data.description:
        parts.append(f"Description: {data.description}")
    if data.module_titles:
        parts.append("Modules: " + ", ".join(data.module_titles))
    return "\n".join(parts)


def _build_resource_document(resource_id: str, data: IndexResourceRequest) -> str:
    """
    Convert a library resource's structured fields into embeddable text.
    """
    parts = [f"Resource: {data.title}"]
    if data.category:
        parts.append(f"Category: {data.category}")
    if data.subject:
        parts.append(f"Subject: {data.subject}")
    if data.domain:
        parts.append(f"Domain: {data.domain}")
    if data.grade:
        parts.append(f"Grade: {data.grade}")
    if data.resource_type:
        parts.append(f"Type: {data.resource_type}")
    if data.description:
        parts.append(f"Description: {data.description}")
    return "\n".join(parts)


# ── ChromaDB helpers ──────────────────────────────────────────────────

def _get_collection():
    """Get the ChromaDB collection, raising IndexingUnavailableError if not ready."""
    try:
        from app.database.chroma import get_collection
        return get_collection()
    except RuntimeError as exc:
        raise IndexingUnavailableError(str(exc)) from exc
    except ImportError:
        raise IndexingUnavailableError(
            "chromadb not installed. Run: pip install -r requirements-ai.txt"
        )


def _upsert(collection, doc_id: str, embedding: list[float], metadata: dict, document: str) -> None:
    """Upsert a single document into ChromaDB (idempotent — safe for updates)."""
    collection.upsert(
        ids=[doc_id],
        embeddings=[embedding],
        metadatas=[metadata],
        documents=[document],
    )


def _delete(collection, doc_id: str) -> None:
    """Delete a document from ChromaDB by ID. No-op if it doesn't exist."""
    try:
        collection.delete(ids=[doc_id])
    except Exception:
        pass  # not in index — nothing to delete


# ── Log helper ────────────────────────────────────────────────────────

async def _log_event(
    db: AsyncSession,
    event_type: str,
    firebase_uid: str,
    payload: dict,
    error: str | None = None,
) -> None:
    log = AILog(
        firebase_uid=firebase_uid,
        event_type=event_type,
        payload=payload,
        error_message=error,
    )
    db.add(log)
    await db.flush()


# ── Public API ────────────────────────────────────────────────────────

async def index_course(
    db: AsyncSession,
    course_id: str,
    data: IndexCourseRequest,
    firebase_uid: str = "system",
) -> dict:
    """
    Index (or re-index) a course into ChromaDB.
    Returns a summary dict for the API response.

    Raises:
        IndexingUnavailableError: ChromaDB not ready.
        IndexingError: Embedding or upsert failed.
    """
    collection = _get_collection()

    document = _build_course_document(course_id, data)
    chroma_id = f"course::{course_id}"

    try:
        embedding = await embed_text(document)
    except EmbeddingError as exc:
        await _log_event(db, "course_indexed", firebase_uid,
                         {"course_id": course_id}, error=str(exc))
        raise IndexingError(f"Embedding failed: {exc}") from exc

    metadata = {
        "type": "course",
        "course_id": course_id,
        "title": data.title,
        "subject": data.subject or "",
        "grade_level": data.grade_level or "",
        "category": data.category or "",
    }

    _upsert(collection, chroma_id, embedding, metadata, document)
    logger.info("Indexed course %s (chroma_id=%s)", course_id, chroma_id)

    await _log_event(db, "course_indexed", firebase_uid, {
        "course_id": course_id,
        "chroma_id": chroma_id,
        "document_length": len(document),
    })

    return {"indexed": True, "chroma_id": chroma_id, "document_length": len(document)}


async def index_resource(
    db: AsyncSession,
    resource_id: str,
    data: IndexResourceRequest,
    firebase_uid: str = "system",
) -> dict:
    """Index (or re-index) a library resource into ChromaDB."""
    collection = _get_collection()

    document = _build_resource_document(resource_id, data)
    chroma_id = f"resource::{resource_id}"

    try:
        embedding = await embed_text(document)
    except EmbeddingError as exc:
        await _log_event(db, "resource_indexed", firebase_uid,
                         {"resource_id": resource_id}, error=str(exc))
        raise IndexingError(f"Embedding failed: {exc}") from exc

    metadata = {
        "type": "resource",
        "resource_id": resource_id,
        "title": data.title,
        "subject": data.subject or "",
        "domain": data.domain or "",
        "grade": data.grade or "",
        "category": data.category or "",
        "resource_type": data.resource_type or "",
    }

    _upsert(collection, chroma_id, embedding, metadata, document)
    logger.info("Indexed resource %s (chroma_id=%s)", resource_id, chroma_id)

    await _log_event(db, "resource_indexed", firebase_uid, {
        "resource_id": resource_id,
        "chroma_id": chroma_id,
        "document_length": len(document),
    })

    return {"indexed": True, "chroma_id": chroma_id, "document_length": len(document)}


async def delete_course_index(
    db: AsyncSession,
    course_id: str,
    firebase_uid: str = "system",
) -> dict:
    """Remove a course from ChromaDB. Returns success even if it wasn't indexed."""
    collection = _get_collection()
    chroma_id = f"course::{course_id}"
    _delete(collection, chroma_id)
    logger.info("Deleted course index %s", chroma_id)
    await _log_event(db, "course_index_deleted", firebase_uid, {"course_id": course_id})
    return {"deleted": True, "chroma_id": chroma_id}


async def delete_resource_index(
    db: AsyncSession,
    resource_id: str,
    firebase_uid: str = "system",
) -> dict:
    """Remove a resource from ChromaDB. Returns success even if it wasn't indexed."""
    collection = _get_collection()
    chroma_id = f"resource::{resource_id}"
    _delete(collection, chroma_id)
    logger.info("Deleted resource index %s", chroma_id)
    await _log_event(db, "resource_index_deleted", firebase_uid, {"resource_id": resource_id})
    return {"deleted": True, "chroma_id": chroma_id}
