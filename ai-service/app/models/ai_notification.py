"""
ai_notifications table — AI-specific notifications (separate from Rajat's MongoDB notifications)
SRS v1.2 §8.3, §8.7
"""

import uuid
from sqlalchemy import Boolean, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy import TIMESTAMP

from app.database.session import Base


class AINotification(Base):
    __tablename__ = "ai_notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    firebase_uid: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        index=True,  # composite index (firebase_uid, is_read) added in migration
    )
    type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        # enum: ai_response_ready | new_resource_indexed | conversation_summary
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    related_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        # conversation_id or message_id (UUID string)
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false")
    )
    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
