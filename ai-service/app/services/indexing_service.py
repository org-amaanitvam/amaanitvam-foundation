"""
Indexing service — orchestrates RAG document indexing into ChromaDB.

Called by the /internal/index-* endpoints when Node.js notifies us that
a course or library resource has been created or updated.

Flow:
  1. Build plain-text document(s) from the structured request fields
  2. Chunk long text (500-token chunks, 50-token overlap)
  3. Call embedding_service.embed_text() → 768-dim vector per chunk (Gemini)
  4. Upsert all chunk vectors into ChromaDB (idempotent — safe to re-call)
  5. Log the event to ai_logs table

Chunking heuristic:
  ~4 chars per token → 500 tokens ≈ 2000 chars, 50 tokens ≈ 200 chars.
  Breaks at word boundaries where possible.

Graceful degradation:
  If ChromaDB is not installed, raises IndexingUnavailableError → 503 response.
"""

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_log import AILog
from app.services.embedding_service import EmbeddingError, embed_text
from app.schemas.indexing import IndexCourseRequest, IndexResourceRequest

logger = logging.getLogger("ai_service")

# ── Collection name constants ─────────────────────────────────────────
COLLECTION_NAME = "learning_content"

# Chunking config (~4 chars per token)
CHUNK_SIZE_CHARS = 2000    # ≈ 500 tokens
CHUNK_OVERLAP_CHARS = 200  # ≈ 50 tokens


# ── Text chunking ─────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE_CHARS, overlap: int = CHUNK_OVERLAP_CHARS) -> list[str]:
    """
    Split text into overlapping chunks for embedding.

    Args:
        text:       Input text (any length).
        chunk_size: Target chunk size in characters (~500 tokens).
        overlap:    Number of overlap characters between consecutive chunks (~50 tokens).

    Returns:
        List of non-empty string chunks. Single-chunk if text fits in one chunk.
    """
    text = text.strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Break at last word boundary to avoid cutting mid-word
        if end < len(text):
            last_space = chunk.rfind(" ")
            if last_space > chunk_size // 2:
                chunk = chunk[:last_space]
                end = start + last_space + 1   # +1 to skip the space

        stripped = chunk.strip()
        if stripped:
            chunks.append(stripped)
        start = end - overlap

    return chunks


class IndexingUnavailableError(Exception):
    """Raised when ChromaDB is not installed / not initialised."""


class IndexingError(Exception):
    """Raised when indexing fails for a non-infrastructure reason."""


# ── Text builders ─────────────────────────────────────────────────────

def _build_course_document(course_id: str, data: "IndexCourseRequest") -> str:
    """
    Convert a course's structured fields into embeddable text.
    If content_blocks are provided (lesson text from Node.js), they are
    appended to give the chunks real semantic content to embed.
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
    if data.content_blocks:
        parts.append("\n" + "\n\n".join(data.content_blocks))
    return "\n".join(parts)


def _build_resource_document(resource_id: str, data: "IndexResourceRequest") -> str:
    """
    Convert a library resource's structured fields into embeddable text.
    If content_blocks are provided (extracted text), they are appended.
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
    if data.content_blocks:
        parts.append("\n" + "\n\n".join(data.content_blocks))
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


def _upsert_chunks(
    collection,
    base_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
    base_metadata: dict,
) -> None:
    """
    Upsert all chunks into ChromaDB.
    Each chunk gets a unique ID: base_id::chunk_0, base_id::chunk_1, ...
    """
    ids = [f"{base_id}::chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {**base_metadata, "chunk_index": i, "chunk_total": len(chunks)}
        for i in range(len(chunks))
    ]
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=chunks,
    )


def _delete_by_prefix(collection, id_prefix: str) -> None:
    """
    Delete all ChromaDB records whose ID starts with id_prefix.
    Used to remove all chunks for a course/resource on re-index or delete.
    """
    try:
        results = collection.get(where_document={"$contains": ""})
        ids_to_delete = [
            doc_id for doc_id in results.get("ids", [])
            if doc_id.startswith(id_prefix)
        ]
        if ids_to_delete:
            collection.delete(ids=ids_to_delete)
    except Exception:
        pass  # nothing to delete


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
    data: "IndexCourseRequest",
    firebase_uid: str = "system",
) -> dict:
    """
    Index (or re-index) a course into ChromaDB with chunking.

    - Builds the full document text from request fields + content_blocks
    - Chunks it into ~500-token overlapping segments
    - Embeds each chunk separately with Gemini
    - Upserts all chunks (idempotent — removes old chunks first)
    - source_id field enables permission-gated $in queries in rag_service

    Raises:
        IndexingUnavailableError: ChromaDB not ready.
        IndexingError: Embedding or upsert failed.
    """
    collection = _get_collection()

    # Delete old chunks before re-indexing (handles count changes)
    _delete_by_prefix(collection, f"course::{course_id}")

    document = _build_course_document(course_id, data)
    chunks = chunk_text(document)
    if not chunks:
        chunks = [document]  # fallback: never index nothing

    base_metadata = {
        "type": "course",
        "source_id": course_id,      # <-- used by rag_service $in filter
        "course_id": course_id,
        "title": data.title,
        "subject": data.subject or "",
        "grade_level": data.grade_level or "",
        "category": data.category or "",
    }

    try:
        embeddings = [await embed_text(chunk) for chunk in chunks]
    except EmbeddingError as exc:
        await _log_event(db, "course_indexed", firebase_uid,
                         {"course_id": course_id}, error=str(exc))
        raise IndexingError(f"Embedding failed: {exc}") from exc

    _upsert_chunks(collection, f"course::{course_id}", chunks, embeddings, base_metadata)
    logger.info("Indexed course %s (%d chunks)", course_id, len(chunks))

    await _log_event(db, "course_indexed", firebase_uid, {
        "course_id": course_id,
        "chunks": len(chunks),
        "document_length": len(document),
    })

    return {"indexed": True, "chroma_id": f"course::{course_id}", "chunks": len(chunks), "document_length": len(document)}


async def index_resource(
    db: AsyncSession,
    resource_id: str,
    data: "IndexResourceRequest",
    firebase_uid: str = "system",
) -> dict:
    """Index (or re-index) a library resource into ChromaDB with chunking."""
    collection = _get_collection()

    _delete_by_prefix(collection, f"resource::{resource_id}")

    document = _build_resource_document(resource_id, data)
    chunks = chunk_text(document)
    if not chunks:
        chunks = [document]

    base_metadata = {
        "type": "resource",
        "source_id": resource_id,    # <-- used by rag_service $in filter
        "resource_id": resource_id,
        "title": data.title,
        "subject": data.subject or "",
        "domain": data.domain or "",
        "grade": data.grade or "",
        "category": data.category or "",
        "resource_type": data.resource_type or "",
    }

    try:
        embeddings = [await embed_text(chunk) for chunk in chunks]
    except EmbeddingError as exc:
        await _log_event(db, "resource_indexed", firebase_uid,
                         {"resource_id": resource_id}, error=str(exc))
        raise IndexingError(f"Embedding failed: {exc}") from exc

    _upsert_chunks(collection, f"resource::{resource_id}", chunks, embeddings, base_metadata)
    logger.info("Indexed resource %s (%d chunks)", resource_id, len(chunks))

    await _log_event(db, "resource_indexed", firebase_uid, {
        "resource_id": resource_id,
        "chunks": len(chunks),
        "document_length": len(document),
    })

    return {"indexed": True, "chroma_id": f"resource::{resource_id}", "chunks": len(chunks), "document_length": len(document)}



async def delete_course_index(
    db: AsyncSession,
    course_id: str,
    firebase_uid: str = "system",
) -> dict:
    """Remove all chunks for a course from ChromaDB."""
    collection = _get_collection()
    _delete_by_prefix(collection, f"course::{course_id}")
    logger.info("Deleted course index for %s", course_id)
    await _log_event(db, "course_index_deleted", firebase_uid, {"course_id": course_id})
    return {"deleted": True, "chroma_id": f"course::{course_id}"}


async def delete_resource_index(
    db: AsyncSession,
    resource_id: str,
    firebase_uid: str = "system",
) -> dict:
    """Remove all chunks for a resource from ChromaDB."""
    collection = _get_collection()
    _delete_by_prefix(collection, f"resource::{resource_id}")
    logger.info("Deleted resource index for %s", resource_id)
    await _log_event(db, "resource_index_deleted", firebase_uid, {"resource_id": resource_id})
    return {"deleted": True, "chroma_id": f"resource::{resource_id}"}
