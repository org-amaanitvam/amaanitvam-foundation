"""
ChromaDB client singleton.

Initialised once at startup via init_chroma().
All services call get_collection() to get the singleton collection.

Graceful degradation (Phase 1-5):
  If chromadb is not installed, init_chroma() logs a warning and returns.
  get_collection() raises RuntimeError — caught by the indexing service
  and converted to a 503 response.

ChromaDB API note:
  Uses the modern chromadb >= 0.4 PersistentClient API.
  The old chromadb.Client(ChromaSettings(chroma_db_impl="duckdb+parquet"...))
  was removed in v0.4.
"""

import logging

from app.config import settings

logger = logging.getLogger("ai_service")

# ── Lazy import for graceful degradation ──────────────────────────────
try:
    import chromadb
    _CHROMADB_AVAILABLE = True
except ImportError:
    _CHROMADB_AVAILABLE = False

# ── Singletons ────────────────────────────────────────────────────────
_chroma_client = None
_learning_content_collection = None

COLLECTION_NAME = "learning_content"


def init_chroma() -> None:
    """
    Initialise the ChromaDB persistent client and ensure the
    'learning_content' collection exists. Called once on service startup.

    If chromadb is not installed (Phase 1-5), logs a warning and returns.
    Install requirements-ai.txt before Phase 6 indexing is used.
    """
    global _chroma_client, _learning_content_collection

    if not _CHROMADB_AVAILABLE:
        logger.warning(
            "chromadb not installed — vector search unavailable. "
            "Run: pip install -r requirements-ai.txt (Phase 6+)"
        )
        return

    # PersistentClient (chromadb >= 0.4) — stores data at CHROMA_PERSIST_DIR
    _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

    # get_or_create: safe to call on every restart
    _learning_content_collection = _chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},  # cosine similarity for semantic search
    )

    logger.info(
        "ChromaDB initialised. Collection '%s' ready (path=%s).",
        COLLECTION_NAME,
        settings.CHROMA_PERSIST_DIR,
    )


def get_chroma_client():
    """Return the ChromaDB client singleton."""
    if _chroma_client is None:
        raise RuntimeError(
            "ChromaDB not initialised. Install requirements-ai.txt and restart."
        )
    return _chroma_client


def get_collection():
    """Return the 'learning_content' collection singleton."""
    if _learning_content_collection is None:
        raise RuntimeError(
            "ChromaDB collection not initialised. "
            "Install requirements-ai.txt and restart the service."
        )
    return _learning_content_collection


def is_available() -> bool:
    """True if ChromaDB was successfully initialised."""
    return _learning_content_collection is not None
