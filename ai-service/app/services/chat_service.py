"""
Chat service — thin orchestrator for the RAG + LLM pipeline.

All heavy lifting is delegated to:
  rag_service     — permission-gated ChromaDB retrieval
  llm_service     — Gemini prompt + generation
  message_service — all DB writes (messages, notifications, logs)

Flow (per request):
  1. Get or create conversation
  2. Save the user message
  3. Fetch conversation history
  4. Permission-gated RAG retrieval
  5. Call Gemini via llm_service
  6. Save the AI message
  7. Update message count + backfill title
  8. Create notification
  9. Log the event
 10. Return (ai_message, conversation_id)
"""

import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.schemas.message import InternalChatRequest
from app.services import message_service, rag_service
from app.services.llm_service import LLMError, generate_response

logger = logging.getLogger("ai_service")


class ChatError(Exception):
    """Raised when the AI pipeline fails (wraps LLMError for the route layer)."""


async def handle_chat(
    db: AsyncSession,
    request: InternalChatRequest,
):
    """
    Main entry point called by POST /internal/chat.

    Returns:
        (ai_message: Message, conversation_id: str)

    Raises:
        ValueError:  Conversation not found or archived.
        ChatError:   Gemini API failed.
    """
    firebase_uid = request.firebase_uid

    # ── Step 1: Get or create conversation ────────────────────────────
    if request.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == UUID(request.conversation_id),
                Conversation.firebase_uid == firebase_uid,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            raise ValueError("Conversation not found or access denied.")
        if conversation.is_archived:
            raise ValueError("Cannot send messages to an archived conversation.")
    else:
        conversation = Conversation(
            firebase_uid=firebase_uid,
            context_type=request.context_type,
            context_id=request.context_id,
            title=None,
        )
        db.add(conversation)
        await db.flush()
        await db.refresh(conversation)

    conversation_id: UUID = conversation.id
    is_first_message: bool = conversation.message_count == 0

    # ── Step 2: Save user message ──────────────────────────────────────
    user_msg = await message_service.save_user_message(
        db, conversation_id, request.message
    )

    # ── Step 3: Fetch conversation history ────────────────────────────
    history = await message_service.fetch_history(db, conversation_id, user_msg.id)

    # ── Step 4: Permission-gated RAG retrieval ────────────────────────
    context_chunks = await rag_service.retrieve_context(
        query=request.message,
        firebase_uid=firebase_uid,
        context_type=request.context_type,
        context_id=request.context_id,
    )
    logger.debug(
        "RAG returned %d chunks for uid=%s", len(context_chunks), firebase_uid
    )

    # ── Step 5: Generate AI response ──────────────────────────────────
    try:
        ai_text, token_count, latency_ms = await generate_response(
            user_message=request.message,
            context_chunks=context_chunks,
            history=history,
        )
    except LLMError as exc:
        await message_service.log_chat_event(
            db, firebase_uid, {"error": str(exc)}, error=str(exc)
        )
        raise ChatError(str(exc)) from exc

    # ── Step 6: Save AI message ────────────────────────────────────────
    ai_msg = await message_service.save_assistant_message(
        db,
        conversation_id,
        content=ai_text,
        token_count=token_count,
        model_used="gemini-1.5-flash",
        latency_ms=latency_ms,
    )

    # ── Step 7: Update conversation metadata ──────────────────────────
    await message_service.increment_message_count(db, conversation_id)
    if is_first_message:
        await message_service.backfill_title(db, conversation, request.message)

    # ── Step 8: Create notification ────────────────────────────────────
    await message_service.create_notification(db, firebase_uid, ai_msg, conversation_id)

    # ── Step 9: Log ────────────────────────────────────────────────────
    await message_service.log_chat_event(db, firebase_uid, {
        "conversation_id": str(conversation_id),
        "user_message_id": str(user_msg.id),
        "ai_message_id": str(ai_msg.id),
        "model": "gemini-1.5-flash",
        "latency_ms": latency_ms,
        "token_count": token_count,
        "rag_chunks_used": len(context_chunks),
    })

    # ── Step 10: Return ────────────────────────────────────────────────
    return ai_msg, str(conversation_id)
