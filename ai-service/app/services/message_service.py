"""
Message service — all DB writes for the chat pipeline.

Extracted from chat_service.py per the implementation plan so that
each concern lives in its own module and can be tested independently.

Functions:
  save_user_message    — persist a user turn
  save_assistant_message — persist the AI response with metadata
  create_notification  — write an AINotification row
  log_chat_event       — write to ai_logs
  backfill_title       — set conversation title from first user message
  fetch_history        — read the last N messages for context
  increment_message_count — update conversations.message_count
"""

import logging
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_log import AILog
from app.models.ai_notification import AINotification
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.message import MessageResponse
from app.services.llm_service import CHAT_MODEL, HISTORY_WINDOW

logger = logging.getLogger("ai_service")


async def save_user_message(
    db: AsyncSession,
    conversation_id: UUID,
    content: str,
) -> Message:
    """Persist a user turn and return the flushed Message row."""
    msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=content,
        is_flagged=False,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg


async def save_assistant_message(
    db: AsyncSession,
    conversation_id: UUID,
    content: str,
    token_count: int | None,
    model_used: str,
    latency_ms: int,
) -> Message:
    """Persist the AI response and return the flushed Message row."""
    msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=content,
        token_count=token_count,
        model_used=model_used,
        latency_ms=latency_ms,
        is_flagged=False,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    return msg


async def fetch_history(
    db: AsyncSession,
    conversation_id: UUID,
    exclude_id: UUID,
) -> list[Message]:
    """
    Return the last HISTORY_WINDOW messages for a conversation,
    excluding the message we just saved (to avoid feeding the current
    user message as part of its own history).
    """
    result = await db.execute(
        select(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.id != exclude_id,
        )
        .order_by(Message.created_at.asc())
        .limit(HISTORY_WINDOW)
    )
    return list(result.scalars().all())


async def backfill_title(
    db: AsyncSession,
    conversation: Conversation,
    user_message: str,
) -> None:
    """Set the conversation title from the first user message (max 80 chars)."""
    title = user_message[:80].strip()
    if len(user_message) > 80:
        title += "…"
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation.id)
        .values(title=title)
    )
    logger.debug("Backfilled conversation title: %s", title)


async def increment_message_count(
    db: AsyncSession,
    conversation_id: UUID,
    by: int = 2,
) -> None:
    """Increment conversations.message_count (user + AI = 2 per exchange)."""
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(message_count=Conversation.message_count + by)
    )


async def create_notification(
    db: AsyncSession,
    firebase_uid: str,
    ai_message: Message,
    conversation_id: UUID,
) -> None:
    """Create an AINotification so the frontend can show a badge."""
    body = ai_message.content[:150]
    if len(ai_message.content) > 150:
        body += "…"

    notification = AINotification(
        firebase_uid=firebase_uid,
        type="ai_response",
        title="New AI Response",
        body=body,
        related_id=str(conversation_id),
        is_read=False,
    )
    db.add(notification)
    await db.flush()


async def log_chat_event(
    db: AsyncSession,
    firebase_uid: str,
    payload: dict,
    error: str | None = None,
) -> None:
    """Write an ai_logs row for this chat exchange."""
    log = AILog(
        firebase_uid=firebase_uid,
        event_type="chat_message",
        payload=payload,
        error_message=error,
    )
    db.add(log)
    await db.flush()
