"""Initial schema — all four AI service tables

Revision ID: 0001
Revises: 
Create Date: 2026-07-23

Tables created:
  - conversations
  - messages       (FK → conversations, CASCADE DELETE)
  - ai_logs        (FK → conversations, SET NULL)
  - ai_notifications

Indexes per SRS v1.2 §8.3:
  conversations:
    idx_conversations_firebase_uid
    idx_conversations_firebase_uid_is_archived   (composite — primary list query)
    idx_conversations_context                    (context_type, context_id)
  messages:
    idx_messages_conversation_id
    idx_messages_created_at
  ai_logs:
    idx_ai_logs_firebase_uid
    idx_ai_logs_event_type
    idx_ai_logs_created_at
  ai_notifications:
    idx_ai_notifications_firebase_uid_is_read    (composite)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── conversations ──────────────────────────────────────────────────
    op.create_table(
        "conversations",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("firebase_uid", sa.String(128), nullable=False),
        sa.Column("mongo_user_id", sa.String(64), nullable=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column(
            "context_type",
            sa.String(50),
            nullable=False,
            server_default="general",
        ),
        sa.Column("context_id", sa.String(64), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column(
            "is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column(
            "message_count", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # conversations indexes
    op.create_index(
        "idx_conversations_firebase_uid",
        "conversations",
        ["firebase_uid"],
    )
    op.create_index(
        "idx_conversations_firebase_uid_is_archived",
        "conversations",
        ["firebase_uid", "is_archived"],
    )
    op.create_index(
        "idx_conversations_context",
        "conversations",
        ["context_type", "context_id"],
    )

    # ── messages ───────────────────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "conversation_id",
            UUID(as_uuid=True),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column(
            "is_flagged",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index("idx_messages_conversation_id", "messages", ["conversation_id"])
    op.create_index("idx_messages_created_at", "messages", ["created_at"])

    # ── ai_logs ────────────────────────────────────────────────────────
    op.create_table(
        "ai_logs",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "conversation_id",
            UUID(as_uuid=True),
            sa.ForeignKey("conversations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("firebase_uid", sa.String(128), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("payload", JSONB(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index("idx_ai_logs_firebase_uid", "ai_logs", ["firebase_uid"])
    op.create_index("idx_ai_logs_event_type", "ai_logs", ["event_type"])
    op.create_index("idx_ai_logs_created_at", "ai_logs", ["created_at"])

    # ── ai_notifications ───────────────────────────────────────────────
    op.create_table(
        "ai_notifications",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("firebase_uid", sa.String(128), nullable=False),
        sa.Column("type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("related_id", sa.String(64), nullable=True),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # Composite index: (firebase_uid, is_read) — primary notification query
    op.create_index(
        "idx_ai_notifications_firebase_uid_is_read",
        "ai_notifications",
        ["firebase_uid", "is_read"],
    )


def downgrade() -> None:
    op.drop_table("ai_notifications")
    op.drop_table("ai_logs")
    op.drop_table("messages")
    op.drop_table("conversations")
