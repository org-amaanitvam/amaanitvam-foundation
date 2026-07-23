"""
Conversation request/response schemas.
SRS v1.2 §8.4 — Conversations endpoints.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Requests ──────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    """POST /api/conversations"""
    context_type: Literal["general", "course", "library_resource"] = "general"
    context_id: str | None = Field(
        default=None,
        description="MongoDB ObjectId of the course or library resource",
    )


# ── Responses ─────────────────────────────────────────────────────────

class ConversationResponse(BaseModel):
    """Full conversation object returned by GET /api/conversations/:id"""
    id: str                    # UUID serialised as string (SRS §8.2)
    firebase_uid: str
    title: str | None
    context_type: str
    context_id: str | None
    is_active: bool
    is_archived: bool
    message_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_model(cls, obj) -> "ConversationResponse":
        return cls(
            id=str(obj.id),
            firebase_uid=obj.firebase_uid,
            title=obj.title,
            context_type=obj.context_type,
            context_id=obj.context_id,
            is_active=obj.is_active,
            is_archived=obj.is_archived,
            message_count=obj.message_count,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )


class ConversationListItem(BaseModel):
    """Lighter shape used in paginated list — omits firebase_uid."""
    id: str
    title: str | None
    context_type: str
    context_id: str | None
    is_archived: bool
    message_count: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_model(cls, obj) -> "ConversationListItem":
        return cls(
            id=str(obj.id),
            title=obj.title,
            context_type=obj.context_type,
            context_id=obj.context_id,
            is_archived=obj.is_archived,
            message_count=obj.message_count,
            updated_at=obj.updated_at,
        )
