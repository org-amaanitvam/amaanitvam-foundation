"""
Conversations router — SRS v1.2 §8.4

Endpoints:
  POST   /api/conversations                          create a conversation
  GET    /api/conversations                          list conversations (paginated)
  GET    /api/conversations/:conversationId          get single conversation
  PATCH  /api/conversations/:conversationId/archive  archive (soft delete)
  GET    /api/conversations/:conversationId/messages list messages (paginated)

All routes require:
  X-Internal-Secret  — verified at router level (Node.js-only access)
  X-Firebase-UID     — forwarded by Node.js after Firebase token verification
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.session import get_db
from app.middleware.internal_auth import verify_internal_secret
from app.middleware.user_header import get_firebase_uid
from app.schemas import (
    APIResponse, PaginatedResponse,
    ConversationCreate, ConversationResponse, ConversationListItem,
    MessageResponse, ErrorCode,
)
from app.services import conversation_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    tags=["conversations"],
    dependencies=[Depends(verify_internal_secret)],
)


# ── POST /api/conversations ────────────────────────────────────────────
@router.post(
    "",
    response_model=APIResponse[ConversationResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    data: ConversationCreate,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conversation. Title is null until the first AI reply."""
    conversation = await conversation_service.create_conversation(db, firebase_uid, data)
    return APIResponse(data=conversation)


# ── GET /api/conversations ─────────────────────────────────────────────
@router.get(
    "",
    response_model=PaginatedResponse[ConversationListItem],
)
async def list_conversations(
    firebase_uid: str = Depends(get_firebase_uid),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    """List conversations for the authenticated user. Excludes archived by default."""
    items, meta = await conversation_service.list_conversations(
        db, firebase_uid, page, limit, include_archived
    )
    return PaginatedResponse(data=items, meta=meta)


# ── GET /api/conversations/:conversationId ────────────────────────────
@router.get(
    "/{conversation_id}",
    response_model=APIResponse[ConversationResponse],
)
async def get_conversation(
    conversation_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """Get a single conversation by ID. Verifies ownership."""
    conversation = await conversation_service.get_conversation(db, conversation_id, firebase_uid)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.CONVERSATION_NOT_FOUND,
                    "message": "Conversation not found.",
                    "details": [],
                },
            },
        )
    return APIResponse(data=ConversationResponse.from_orm_model(conversation))


# ── PATCH /api/conversations/:conversationId/archive ──────────────────
@router.patch(
    "/{conversation_id}/archive",
    response_model=APIResponse[ConversationResponse],
)
async def archive_conversation(
    conversation_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """
    Archive a conversation (soft delete).
    SRS §8.4: DELETE description maps to this endpoint — archived, not destroyed.
    """
    conversation = await conversation_service.archive_conversation(db, conversation_id, firebase_uid)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.CONVERSATION_NOT_FOUND,
                    "message": "Conversation not found.",
                    "details": [],
                },
            },
        )
    return APIResponse(data=ConversationResponse.from_orm_model(conversation))


# ── GET /api/conversations/:conversationId/messages ───────────────────
@router.get(
    "/{conversation_id}/messages",
    response_model=PaginatedResponse[MessageResponse],
)
async def list_messages(
    conversation_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    List messages for a conversation, ordered oldest-first (natural chat order).
    Default limit is 50 (larger than conversations — fewer round trips).
    """
    result = await conversation_service.list_messages(db, conversation_id, firebase_uid, page, limit)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.CONVERSATION_NOT_FOUND,
                    "message": "Conversation not found.",
                    "details": [],
                },
            },
        )
    items, meta = result
    return PaginatedResponse(data=items, meta=meta)
