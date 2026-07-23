try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    _CHROMADB_AVAILABLE = True
except ImportError:
    _CHROMADB_AVAILABLE = False

from app.config import settings

# ── Singleton ──────────────────────────────────────────────────────────
_chroma_client = None
_learning_content_collection = None

COLLECTION_NAME = "learning_content"


def init_chroma() -> None:
    """
    Initialise the ChromaDB persistent client and ensure the
    'learning_content' collection exists. Called once on service startup.

    If chromadb is not installed (Phase 1-5), logs a warning and returns.
    Install requirements-ai.txt before Phase 6.
    """
    global _chroma_client, _learning_content_collection

    if not _CHROMADB_AVAILABLE:
        import logging
        logging.getLogger("ai_service").warning(
            "chromadb not installed — vector search unavailable. "
            "Run: pip install -r requirements-ai.txt (Phase 6+)"
        )
        return

    _chroma_client = chromadb.Client(
        ChromaSettings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=settings.CHROMA_PERSIST_DIR,
            anonymized_telemetry=False,
        )
    )

    # get_or_create so reruns don't raise CollectionAlreadyExists
    _learning_content_collection = _chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},  # cosine similarity for embeddings
    )


def get_chroma_client():
    if _chroma_client is None:
        raise RuntimeError(
            "ChromaDB not initialised. Install requirements-ai.txt and restart."
        )
    return _chroma_client


def get_collection():
    """Return the learning_content collection (the only collection we use)."""
    if _learning_content_collection is None:
        raise RuntimeError(
            "ChromaDB collection not initialised. Install requirements-ai.txt and restart."
        )
    return _learning_content_collection
