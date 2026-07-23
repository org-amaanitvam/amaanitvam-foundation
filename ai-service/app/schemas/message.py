"""
Message request/response schemas.
SRS v1.2 §8.4 — Messages endpoints + Internal /internal/chat.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Public request (from Node.js proxy → this service) ───────────────

class MessageCreate(BaseModel):
    """
    POST /api/conversations/:conversationId/messages

    Client sends this to Node.js, Node.js forwards to /internal/chat.
    content must be non-empty after stripping whitespace.
    """
    content: str = Field(..., min_length=1, max_length=4000)
    context_type: Literal["general", "course", "library_resource"] = "general"
    context_id: str | None = Field(
        default=None,
        description="MongoDB ObjectId of the course or library resource",
    )

    @field_validator("content")
    @classmethod
    def content_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message content cannot be blank.")
        return stripped


# ── Internal request (Node.js → POST /internal/chat) ─────────────────

class InternalChatRequest(BaseModel):
    """
    POST /internal/chat — called by the Node.js Main API only.
    Node.js has already verified the Firebase token and extracted firebase_uid.
    """
    firebase_uid: str = Field(..., min_length=1)
    conversation_id: str | None = Field(
        default=None,
        description="UUID of existing conversation. If null, a new one is created.",
    )
    message: str = Field(..., min_length=1, max_length=4000)
    context_type: Literal["general", "course", "library_resource"] = "general"
    context_id: str | None = None

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be blank.")
        return stripped


# ── Responses ─────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    """
    Single message — returned in message list and as the assistant reply.
    SRS §8.4 response example.
    """
    id: str                          # UUID as string
    conversation_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    token_count: int | None
    model_used: str | None
    latency_ms: int | None
    is_flagged: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_model(cls, obj) -> "MessageResponse":
        return cls(
            id=str(obj.id),
            conversation_id=str(obj.conversation_id),
            role=obj.role,
            content=obj.content,
            token_count=obj.token_count,
            model_used=obj.model_used,
            latency_ms=obj.latency_ms,
            is_flagged=obj.is_flagged,
            created_at=obj.created_at,
        )


class InternalChatResponse(BaseModel):
    """Response body returned from POST /internal/chat to Node.js."""
    success: bool = True
    data: MessageResponse
    conversation_id: str    # so Node.js knows which conversation was used/created
