"""
Internal router — all endpoints protected by X-Internal-Secret.
Called exclusively by the Node.js Main API, never by the browser.

Routes:
  Phase 4 : GET  /internal/health
  Phase 6 : POST   /internal/index-course/:courseId
            DELETE /internal/index-course/:courseId
            POST   /internal/index-resource/:resourceId
            DELETE /internal/index-resource/:resourceId
  Phase 7 : POST /internal/chat
            GET  /internal/users/:firebaseUid/permissions
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.middleware.internal_auth import verify_internal_secret
from app.middleware.user_header import get_firebase_uid
from app.middleware.rate_limiter import check_message_rate_limit
from app.schemas.indexing import IndexCourseRequest, IndexResourceRequest, IndexResponse
from app.schemas.message import InternalChatRequest, InternalChatResponse, MessageResponse
from app.services import indexing_service
from app.services.indexing_service import IndexingUnavailableError, IndexingError
from app.services.chat_service import handle_chat, ChatError
from app.schemas.common import ErrorCode

logger = logging.getLogger("ai_service")

# All routes on this router automatically require a valid X-Internal-Secret.
router = APIRouter(
    tags=["internal"],
    dependencies=[Depends(verify_internal_secret)],
)


# ── Health ─────────────────────────────────────────────────────────────
@router.get("/health")
async def internal_health():
    """
    Internal health check — reports DB and ChromaDB status.
    More detailed than the public /health endpoint.
    """
    from app.database.chroma import is_available as chroma_ok

    return {
        "status": "ok",
        "chroma": "ready" if chroma_ok() else "unavailable (install requirements-ai.txt)",
    }


# ── Chat ────────────────────────────────────────────────────────────────
@router.post(
    "/chat",
    response_model=InternalChatResponse,
    status_code=status.HTTP_200_OK,
)
async def internal_chat(
    data: InternalChatRequest,
    db: AsyncSession = Depends(get_db),
    _rate: None = Depends(check_message_rate_limit),
):
    """
    POST /internal/chat — called exclusively by the Node.js Main API.

    Node.js has already:
      1. Verified the Firebase token (verifyIdToken)
      2. Populated firebase_uid in the request body
      3. Added X-Internal-Secret for service-to-service auth

    This endpoint:
      - Runs the RAG retrieval pipeline
      - Calls Gemini for the AI response
      - Saves both the user and AI messages to PostgreSQL
      - Creates an AINotification
      - Returns the AI message to Node.js
    """
    try:
        ai_message, conversation_id = await handle_chat(db, data)
        return InternalChatResponse(
            success=True,
            data=MessageResponse.from_orm_model(ai_message),
            conversation_id=conversation_id,
        )
    except ValueError as exc:
        # Conversation not found or archived
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.CONVERSATION_NOT_FOUND,
                    "message": str(exc),
                    "details": [],
                },
            },
        )
    except ChatError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.LLM_UNAVAILABLE,
                    "message": str(exc),
                    "details": [],
                },
            },
        )


# ── Course indexing ────────────────────────────────────────────────────

@router.post(
    "/index-course/{course_id}",
    response_model=IndexResponse,
    status_code=status.HTTP_200_OK,
)
async def index_course(
    course_id: str,
    data: IndexCourseRequest,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """
    Index (or re-index) a course into ChromaDB.
    Called by Node.js when a course is created or updated.
    Idempotent — safe to call multiple times.
    """
    try:
        result = await indexing_service.index_course(db, course_id, data, firebase_uid)
        return IndexResponse(data=result)
    except IndexingUnavailableError as exc:
        logger.warning("Indexing unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {
                    "code": "CHROMA_UNAVAILABLE",
                    "message": str(exc),
                    "details": [],
                },
            },
        )
    except IndexingError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.INDEXING_FAILED,
                    "message": str(exc),
                    "details": [],
                },
            },
        )


@router.delete(
    "/index-course/{course_id}",
    response_model=IndexResponse,
)
async def delete_course_index(
    course_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a course from ChromaDB.
    Called by Node.js when a course is deleted.
    """
    try:
        result = await indexing_service.delete_course_index(db, course_id, firebase_uid)
        return IndexResponse(data=result)
    except IndexingUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {"code": "CHROMA_UNAVAILABLE", "message": str(exc), "details": []},
            },
        )


# ── Resource indexing ──────────────────────────────────────────────────

@router.post(
    "/index-resource/{resource_id}",
    response_model=IndexResponse,
    status_code=status.HTTP_200_OK,
)
async def index_resource(
    resource_id: str,
    data: IndexResourceRequest,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """
    Index (or re-index) a library resource into ChromaDB.
    Called by Node.js when a resource is uploaded or updated.
    Idempotent — safe to call multiple times.
    """
    try:
        result = await indexing_service.index_resource(db, resource_id, data, firebase_uid)
        return IndexResponse(data=result)
    except IndexingUnavailableError as exc:
        logger.warning("Indexing unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {"code": "CHROMA_UNAVAILABLE", "message": str(exc), "details": []},
            },
        )
    except IndexingError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.INDEXING_FAILED,
                    "message": str(exc),
                    "details": [],
                },
            },
        )


@router.delete(
    "/index-resource/{resource_id}",
    response_model=IndexResponse,
)
async def delete_resource_index(
    resource_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """Remove a library resource from ChromaDB."""
    try:
        result = await indexing_service.delete_resource_index(db, resource_id, firebase_uid)
        return IndexResponse(data=result)
    except IndexingUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {"code": "CHROMA_UNAVAILABLE", "message": str(exc), "details": []},
            },
        )
