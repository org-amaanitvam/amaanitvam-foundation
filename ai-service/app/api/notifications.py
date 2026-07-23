"""
AI Notifications router — SRS v1.2 §8.4

Endpoints:
  GET   /api/ai-notifications                          list notifications (paginated)
  PATCH /api/ai-notifications/:notificationId/read     mark single as read
  PATCH /api/ai-notifications/read-all                 mark all as read

Note: These are Aryan's PostgreSQL AI notifications.
Completely separate from Rajat's MongoDB notifications collection.
See SRS §8.7 for boundary.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.session import get_db
from app.middleware.internal_auth import verify_internal_secret
from app.middleware.user_header import get_firebase_uid
from app.schemas import (
    APIResponse, PaginatedResponse,
    NotificationResponse, NotificationListItem, ErrorCode,
)
from app.services import notification_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(
    tags=["ai-notifications"],
    dependencies=[Depends(verify_internal_secret)],
)


# ── GET /api/ai-notifications ─────────────────────────────────────────
@router.get(
    "",
    response_model=PaginatedResponse[NotificationListItem],
)
async def list_notifications(
    firebase_uid: str = Depends(get_firebase_uid),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    unread_only: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    """
    List AI notifications for the user.
    Pass unread_only=true to filter to unread only.
    """
    items, meta = await notification_service.list_notifications(
        db, firebase_uid, page, limit, unread_only
    )
    return PaginatedResponse(data=items, meta=meta)


# ── PATCH /api/ai-notifications/read-all ─────────────────────────────
# Must be defined BEFORE /:notificationId/read to avoid route shadowing.
@router.patch("/read-all")
async def mark_all_read(
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications as read for this user."""
    count = await notification_service.mark_all_notifications_read(db, firebase_uid)
    return {"success": True, "data": {"updated_count": count}}


# ── PATCH /api/ai-notifications/:notificationId/read ─────────────────
@router.patch(
    "/{notification_id}/read",
    response_model=APIResponse[NotificationResponse],
)
async def mark_notification_read(
    notification_id: str,
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncSession = Depends(get_db),
):
    """Mark a single notification as read."""
    notification = await notification_service.mark_notification_read(
        db, notification_id, firebase_uid
    )
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "error": {
                    "code": ErrorCode.NOTIFICATION_NOT_FOUND,
                    "message": "Notification not found.",
                    "details": [],
                },
            },
        )
    return APIResponse(data=NotificationResponse.from_orm_model(notification))
