"""
Per-user rate limiter for message sending — 30 messages per minute per firebase_uid.

Phase 4: In-memory implementation using a sliding window counter.
Phase 10: Swap the store for Redis (swap _store + _get/_increment) when deploying
          to Render multi-instance — in-memory doesn't work across replicas.

Usage as a FastAPI dependency:
    from app.middleware.rate_limiter import check_message_rate_limit

    @router.post("/chat")
    async def handle_chat(
        payload: InternalChatRequest,
        _: None = Depends(check_message_rate_limit),
    ):
        ...
"""

import time
from collections import defaultdict, deque
from fastapi import Depends, HTTPException, status

from app.schemas.message import InternalChatRequest

# ── Config ────────────────────────────────────────────────────────────
MAX_MESSAGES = 30          # per window
WINDOW_SECONDS = 60        # 1 minute

# ── In-memory store ───────────────────────────────────────────────────
# { firebase_uid: deque of timestamps (float) }
_store: dict[str, deque] = defaultdict(deque)


def _is_rate_limited(firebase_uid: str) -> bool:
    """
    Sliding window check. Returns True if the user has hit the limit.
    Thread-safe enough for single-process dev; replace with Redis for prod.
    """
    now = time.monotonic()
    window_start = now - WINDOW_SECONDS
    timestamps = _store[firebase_uid]

    # Drop timestamps older than the window
    while timestamps and timestamps[0] < window_start:
        timestamps.popleft()

    if len(timestamps) >= MAX_MESSAGES:
        return True

    timestamps.append(now)
    return False


async def check_message_rate_limit(payload: InternalChatRequest) -> None:
    """
    FastAPI dependency for /internal/chat.
    Reads firebase_uid from the already-parsed request body.
    """
    if _is_rate_limited(payload.firebase_uid):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "success": False,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": (
                        f"Message limit of {MAX_MESSAGES} per minute reached. "
                        "Please wait before sending more messages."
                    ),
                    "details": [],
                },
            },
        )
