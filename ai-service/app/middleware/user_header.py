"""
User identity dependency — extracts X-Firebase-UID set by the Node.js Main API.

The AI service never verifies Firebase tokens itself.
Node.js verifies the token, extracts firebase_uid, and forwards it here
alongside X-Internal-Secret so we know the request is trusted.

Usage:
    from app.middleware.user_header import get_firebase_uid

    @router.get("/conversations")
    async def list_conversations(
        firebase_uid: str = Depends(get_firebase_uid),
        ...
    ):
"""

from fastapi import Header, HTTPException, status


async def get_firebase_uid(
    x_firebase_uid: str = Header(
        ...,
        alias="X-Firebase-UID",
        description="Firebase UID forwarded by the Node.js Main API after token verification.",
    )
) -> str:
    """Returns the firebase_uid string, or raises 400 if empty/missing."""
    uid = x_firebase_uid.strip()
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "X-Firebase-UID header is required.",
                    "details": [],
                },
            },
        )
    return uid
