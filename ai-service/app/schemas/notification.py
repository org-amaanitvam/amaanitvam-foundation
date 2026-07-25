"""
AI Notification request/response schemas.
SRS v1.2 §8.4 — AI Notifications endpoints.

Note: These are Aryan's PostgreSQL-backed AI notifications.
They are completely separate from Rajat's MongoDB `notifications` collection.
See SRS §8.7 for boundary clarification.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


# ── Responses ─────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    """Single AI notification."""
    id: str                     # UUID as string
    firebase_uid: str
    type: Literal[
        "ai_response_ready",
        "new_resource_indexed",
        "conversation_summary",
    ]
    title: str
    body: str
    related_id: str | None      # conversation_id or message_id
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_model(cls, obj) -> "NotificationResponse":
        return cls(
            id=str(obj.id),
            firebase_uid=obj.firebase_uid,
            type=obj.type,
            title=obj.title,
            body=obj.body,
            related_id=obj.related_id,
            is_read=obj.is_read,
            created_at=obj.created_at,
        )


class NotificationListItem(BaseModel):
    """Lighter shape for paginated notification list — omits firebase_uid."""
    id: str
    type: str
    title: str
    body: str
    related_id: str | None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_model(cls, obj) -> "NotificationListItem":
        return cls(
            id=str(obj.id),
            type=obj.type,
            title=obj.title,
            body=obj.body,
            related_id=obj.related_id,
            is_read=obj.is_read,
            created_at=obj.created_at,
        )
