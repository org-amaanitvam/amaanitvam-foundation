"""
Internal router — all endpoints protected by X-Internal-Secret.
Called exclusively by the Node.js Main API, never by the browser.

Routes filled across phases:
  Phase 4 : GET  /internal/health         ← this file
  Phase 6 : POST /internal/index-course/:courseId
            POST /internal/index-resource/:resourceId
            DELETE /internal/index-course/:courseId
            DELETE /internal/index-resource/:resourceId
  Phase 7 : POST /internal/chat
            GET  /internal/users/:firebaseUid/permissions  (proxy to Node.js)
"""

from fastapi import APIRouter, Depends

from app.middleware.internal_auth import verify_internal_secret

# All routes on this router automatically require a valid X-Internal-Secret.
router = APIRouter(
    tags=["internal"],
    dependencies=[Depends(verify_internal_secret)],
)


# ── Health ─────────────────────────────────────────────────────────────
@router.get("/health")
async def internal_health():
    """
    Internal health check — includes DB + ChromaDB status.
    More detailed than the public /health endpoint.
    Full implementation (DB ping) added in Phase 6.
    """
    return {
        "status": "ok",
        "db": "not_checked_yet",   # Phase 6 will ping PostgreSQL here
        "chroma": "not_checked_yet",
    }
