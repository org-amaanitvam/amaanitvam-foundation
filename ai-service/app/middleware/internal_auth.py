"""
Internal auth dependency — validates the X-Internal-Secret header.

All /internal/* routes use this as a FastAPI dependency.
The secret is shared between the Node.js Main API and this service via env vars.
Neither service exposes it to the public internet.

Usage in a route:
    from app.middleware.internal_auth import verify_internal_secret

    @router.post("/chat", dependencies=[Depends(verify_internal_secret)])
    async def handle_chat(...):
        ...
"""

import secrets
from fastapi import Header, HTTPException, status

from app.config import settings


async def verify_internal_secret(
    x_internal_secret: str = Header(
        ...,
        alias="X-Internal-Secret",
        description="Shared secret between Node.js Main API and AI Service.",
    )
) -> None:
    """
    FastAPI dependency injected on every /internal/ route.
    Uses `secrets.compare_digest` to prevent timing-attack comparisons.
    Raises 403 (not 401) because this is a service-to-service secret, not user auth.
    """
    if not secrets.compare_digest(
        x_internal_secret.encode("utf-8"),
        settings.INTERNAL_SHARED_SECRET.encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "error": {
                    "code": "INTERNAL_SECRET_INVALID",
                    "message": "Invalid or missing internal secret.",
                    "details": [],
                },
            },
        )
