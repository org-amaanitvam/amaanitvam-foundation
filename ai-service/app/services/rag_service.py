"""
RAG service — permission-gated vector search.

Flow:
  1. Call permission_service to get what the user is allowed to see
  2. Build a ChromaDB where-filter using the allowed IDs
  3. Embed the query with Gemini text-embedding-004
  4. Query ChromaDB with n_results=5
  5. Return the retrieved text chunks

Graceful degradation:
  - If permission service fails → log warning, return [] (no context leak)
  - If ChromaDB not installed → log debug, return []
  - If embedding fails → log warning, return []

By returning [] in all error cases the chat pipeline still works
(Gemini answers from its training data) but never reveals restricted content.
"""

import logging

from app.services.permission_service import PermissionServiceError, get_user_permissions

logger = logging.getLogger("ai_service")

RAG_TOP_K = 5     # matches the plan's n_results=5


async def retrieve_context(
    query: str,
    firebase_uid: str,
    context_type: str = "general",
    context_id: str | None = None,
) -> list[str]:
    """
    Permission-gated ChromaDB retrieval.

    Args:
        query: The user's message text (used to build the query embedding).
        firebase_uid: The authenticated user's Firebase UID.
        context_type: "general" | "course" | "library_resource"
        context_id: MongoDB ID of the specific course or resource (optional).

    Returns:
        List of retrieved text chunks (may be empty).
    """
    # ── Step 1: Get permissions ────────────────────────────────────────
    try:
        permissions = await get_user_permissions(firebase_uid)
    except PermissionServiceError as exc:
        logger.warning(
            "Permission service unavailable — returning no RAG context: %s", exc
        )
        return []

    enrolled_course_ids: list[str] = permissions.get("enrolled_course_ids", [])
    accessible_resource_ids: list[str] = permissions.get("accessible_resource_ids", [])
    allowed_ids: list[str] = enrolled_course_ids + accessible_resource_ids

    if not allowed_ids:
        logger.debug("User %s has no accessible content — skipping RAG.", firebase_uid)
        return []

    # ── Step 2: Build ChromaDB filter ─────────────────────────────────
    # If a specific context is requested, scope to that ID only (if allowed).
    # Otherwise, search across all allowed IDs.
    if context_id and context_id in allowed_ids:
        where_filter: dict = {"source_id": {"$eq": context_id}}
    elif context_id and context_id not in allowed_ids:
        logger.info(
            "User %s requested context_id=%s they are NOT enrolled in — filtered out.",
            firebase_uid, context_id,
        )
        return []
    elif len(allowed_ids) == 1:
        where_filter = {"source_id": {"$eq": allowed_ids[0]}}
    else:
        where_filter = {"source_id": {"$in": allowed_ids}}

    # ── Step 3: ChromaDB query ─────────────────────────────────────────
    try:
        from app.database.chroma import get_collection
        from app.services.embedding_service import embed_query

        collection = get_collection()
        query_embedding = await embed_query(query)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=RAG_TOP_K,
            where=where_filter,
        )
        chunks: list[str] = results.get("documents", [[]])[0]

        logger.debug(
            "RAG: retrieved %d chunks for uid=%s (filter=%s)",
            len(chunks), firebase_uid, where_filter,
        )
        return chunks

    except RuntimeError:
        logger.debug("ChromaDB not initialised — skipping RAG.")
        return []
    except Exception as exc:
        logger.warning("RAG query failed (non-fatal): %s", exc)
        return []
