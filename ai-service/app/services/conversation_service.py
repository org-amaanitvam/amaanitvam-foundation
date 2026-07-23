"""
Conversation service — all database logic for the conversations table.
Routes call these functions; nothing DB-related lives in the router files.
"""

from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationCreate, ConversationListItem, ConversationResponse
from app.schemas.message import MessageResponse
from app.schemas.common import PaginationMeta


# ── Create ────────────────────────────────────────────────────────────

async def create_conversation(
    db: AsyncSession,
    firebase_uid: str,
    data: ConversationCreate,
) -> ConversationResponse:
    """Create a new conversation and return it."""
    conversation = Conversation(
        firebase_uid=firebase_uid,
        context_type=data.context_type,
        context_id=data.context_id,
        # Title starts null; Phase 7 (LLM) will backfill it after the first reply
        title=None,
    )
    db.add(conversation)
    await db.flush()   # get the generated UUID without committing
    await db.refresh(conversation)
    return ConversationResponse.from_orm_model(conversation)


# ── List ──────────────────────────────────────────────────────────────

async def list_conversations(
    db: AsyncSession,
    firebase_uid: str,
    page: int = 1,
    limit: int = 20,
    include_archived: bool = False,
) -> tuple[list[ConversationListItem], PaginationMeta]:
    """
    Return paginated active conversations for a user.
    Default: excludes archived. Pass include_archived=True to include them.
    Ordered by updated_at DESC (most recently active first).
    """
    base_query = (
        select(Conversation)
        .where(Conversation.firebase_uid == firebase_uid)
    )
    if not include_archived:
        base_query = base_query.where(Conversation.is_archived == False)  # noqa: E712

    # Total count
    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar_one()

    # Paginated result
    offset = (page - 1) * limit
    result = await db.execute(
        base_query
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    conversations = result.scalars().all()

    items = [ConversationListItem.from_orm_model(c) for c in conversations]
    meta = PaginationMeta(page=page, limit=limit, total=total)
    return items, meta


# ── Get single ────────────────────────────────────────────────────────

async def get_conversation(
    db: AsyncSession,
    conversation_id: str,
    firebase_uid: str,
) -> Conversation | None:
    """
    Return a conversation by ID, verifying ownership.
    Returns None if not found or belongs to a different user.
    """
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == UUID(conversation_id),
            Conversation.firebase_uid == firebase_uid,
        )
    )
    return result.scalar_one_or_none()


# ── Archive ───────────────────────────────────────────────────────────

async def archive_conversation(
    db: AsyncSession,
    conversation_id: str,
    firebase_uid: str,
) -> Conversation | None:
    """
    Set is_archived=True. Returns the updated conversation or None if not found.
    SRS §8.4: DELETE /api/conversations/:conversationId is a soft archive.
    """
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == UUID(conversation_id),
            Conversation.firebase_uid == firebase_uid,
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        return None

    await db.execute(
        update(Conversation)
        .where(Conversation.id == UUID(conversation_id))
        .values(is_archived=True)
    )
    await db.flush()
    await db.refresh(conversation)
    return conversation


# ── Messages in a conversation ────────────────────────────────────────

async def list_messages(
    db: AsyncSession,
    conversation_id: str,
    firebase_uid: str,
    page: int = 1,
    limit: int = 50,
) -> tuple[list[MessageResponse], PaginationMeta] | None:
    """
    Return paginated messages for a conversation.
    Verifies conversation ownership before returning.
    Returns None if conversation not found / not owned by user.
    """
    # Verify ownership
    conversation = await get_conversation(db, conversation_id, firebase_uid)
    if conversation is None:
        return None

    # Count
    count_result = await db.execute(
        select(func.count()).where(Message.conversation_id == UUID(conversation_id))
    )
    total = count_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == UUID(conversation_id))
        .order_by(Message.created_at.asc())   # oldest first (chat order)
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()

    items = [MessageResponse.from_orm_model(m) for m in messages]
    meta = PaginationMeta(page=page, limit=limit, total=total)
    return items, meta
