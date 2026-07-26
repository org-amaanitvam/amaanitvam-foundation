"""
Embedding service — wraps Google Gemini text-embedding-004.

Uses the new `google-genai` SDK (google.genai), NOT the deprecated
`google-generativeai` (google.generativeai) package.

Used by the indexing service (Phase 6) and RAG retrieval pipeline (Phase 7).
All embedding calls go through here so the model can be swapped in one place.
"""

import logging

from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger("ai_service")

# ── Model config ──────────────────────────────────────────────────────
EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIMENSION = 768   # text-embedding-004 output dimension

# Singleton client (initialised on first use)
_client: genai.Client | None = None


class EmbeddingError(Exception):
    """Raised when the Gemini embedding API call fails."""


def _get_client() -> genai.Client:
    """Return (or create) the singleton Gemini client."""
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise EmbeddingError(
                "GEMINI_API_KEY is not set. Cannot generate embeddings."
            )
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def embed_text(text: str) -> list[float]:
    """
    Generate a single embedding vector for a document.

    Uses task_type=RETRIEVAL_DOCUMENT — optimised for indexing.
    text-embedding-004 limit is ~2048 tokens; we trim to ~8000 chars as proxy.

    Returns:
        list[float] of length 768.

    Raises:
        EmbeddingError: If the API call fails.
    """
    client = _get_client()
    text = text[:8000].strip()
    if not text:
        raise EmbeddingError("Cannot embed empty text.")

    try:
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
            ),
        )
        embedding = result.embeddings[0].values
        logger.debug("Generated embedding: dim=%d", len(embedding))
        return list(embedding)
    except Exception as exc:
        logger.error("Gemini embedding failed: %s", exc)
        raise EmbeddingError(f"Embedding API error: {exc}") from exc


async def embed_query(query: str) -> list[float]:
    """
    Generate an embedding for a user search query.

    Uses task_type=RETRIEVAL_QUERY — optimised for retrieval.
    Used during RAG context retrieval in Phase 7.
    """
    client = _get_client()
    query = query[:8000].strip()
    if not query:
        raise EmbeddingError("Cannot embed empty query.")

    try:
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
            ),
        )
        return list(result.embeddings[0].values)
    except Exception as exc:
        raise EmbeddingError(f"Embedding API error: {exc}") from exc
