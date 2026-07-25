"""
Notification service — all database logic for ai_notifications table.
Called by Phase 7 message_service (create) and Phase 5 notifications router (read/mark).
"""

from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_notification import AINotification
from app.schemas.notification import NotificationListItem, NotificationResponse
from app.schemas.common import PaginationMeta


# ── Create (internal — called by message_service in Phase 7) ──────────

async def create_notification(
    db: AsyncSession,
    firebase_uid: str,
    type: str,
    title: str,
    body: str,
    related_id: str | None = None,
) -> AINotification:
    """
    Create an AI notification record.
    Called internally after an AI response is generated (Phase 7).
    """
    notification = AINotification(
        firebase_uid=firebase_uid,
        type=type,
        title=title,
        body=body,
        related_id=related_id,
        is_read=False,
    )
    db.add(notification)
    await db.flush()
    await db.refresh(notification)
    return notification


# ── List ──────────────────────────────────────────────────────────────

async def list_notifications(
    db: AsyncSession,
    firebase_uid: str,
    page: int = 1,
    limit: int = 20,
    unread_only: bool = False,
) -> tuple[list[NotificationListItem], PaginationMeta]:
    """
    Return paginated AI notifications for a user.
    Default: all notifications. Pass unread_only=True to filter.
    Ordered by created_at DESC (newest first).
    SRS §8.4: GET /api/ai-notifications?page=1&limit=20
    """
    base_query = select(AINotification).where(
        AINotification.firebase_uid == firebase_uid
    )
    if unread_only:
        base_query = base_query.where(AINotification.is_read == False)  # noqa: E712

    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(
        base_query
        .order_by(AINotification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    notifications = result.scalars().all()

    items = [NotificationListItem.from_orm_model(n) for n in notifications]
    meta = PaginationMeta(page=page, limit=limit, total=total)
    return items, meta


# ── Mark single as read ───────────────────────────────────────────────

async def mark_notification_read(
    db: AsyncSession,
    notification_id: str,
    firebase_uid: str,
) -> AINotification | None:
    """
    Mark a single notification as read.
    Returns None if not found or not owned by this user.
    SRS §8.4: PATCH /api/ai-notifications/:notificationId/read
    """
    result = await db.execute(
        select(AINotification).where(
            AINotification.id == UUID(notification_id),
            AINotification.firebase_uid == firebase_uid,
        )
    )
    notification = result.scalar_one_or_none()
    if notification is None:
        return None

    await db.execute(
        update(AINotification)
        .where(AINotification.id == UUID(notification_id))
        .values(is_read=True)
    )
    await db.flush()
    await db.refresh(notification)
    return notification


# ── Mark all as read ──────────────────────────────────────────────────

async def mark_all_notifications_read(
    db: AsyncSession,
    firebase_uid: str,
) -> int:
    """
    Mark ALL unread notifications for a user as read.
    Returns the count of rows updated.
    SRS §8.4: PATCH /api/ai-notifications/read-all
    """
    result = await db.execute(
        update(AINotification)
        .where(
            AINotification.firebase_uid == firebase_uid,
            AINotification.is_read == False,  # noqa: E712
        )
        .values(is_read=True)
        .execution_options(synchronize_session=False)
    )
    return result.rowcount
