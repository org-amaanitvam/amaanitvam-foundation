"""
Permission service — calls the Node.js Main API to check what content
a user is authorised to access.

Called by rag_service before every ChromaDB query to ensure the AI
only surfaces content the user is actually enrolled in or has access to.

The Node.js endpoint it calls:
    GET {MAIN_API_URL}/internal/users/:firebaseUid/permissions
    Headers: X-Internal-Secret: <shared_secret>

Expected response:
    {
        "role": "student" | "teacher" | "admin",
        "enrolled_course_ids": ["mongo_id_1", "mongo_id_2", ...],
        "accessible_resource_ids": ["res_id_1", ...]
    }

Graceful degradation:
    If Node.js is unreachable or returns an error, raises PermissionServiceError.
    rag_service catches this and falls back to no context (safe — no content leak).
"""

import logging

import httpx

from app.config import settings

logger = logging.getLogger("ai_service")


class PermissionServiceError(Exception):
    """Raised when the permission check call to Node.js fails."""


async def get_user_permissions(firebase_uid: str) -> dict:
    """
    Fetch user permissions from the Node.js Main API.

    Returns:
        dict with keys:
            role (str): "student" | "teacher" | "admin"
            enrolled_course_ids (list[str]): MongoDB course IDs the user is enrolled in
            accessible_resource_ids (list[str]): Library resource IDs the user can access

    Raises:
        PermissionServiceError: On timeout, HTTP error, or unexpected response.
    """
    url = f"{settings.MAIN_API_URL}/internal/users/{firebase_uid}/permissions"
    headers = {"X-Internal-Secret": settings.INTERNAL_SHARED_SECRET}

    logger.debug("Fetching permissions for uid=%s from %s", firebase_uid, url)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

    except httpx.TimeoutException:
        raise PermissionServiceError(
            f"Permission service timed out after 5s (uid={firebase_uid})"
        )
    except httpx.HTTPStatusError as exc:
        raise PermissionServiceError(
            f"Permission service returned HTTP {exc.response.status_code} "
            f"for uid={firebase_uid}"
        )
    except httpx.RequestError as exc:
        raise PermissionServiceError(
            f"Permission service unreachable: {exc} (MAIN_API_URL={settings.MAIN_API_URL})"
        )

    # Normalise — ensure lists always exist even if Node.js omits them
    return {
        "role": data.get("role", "student"),
        "enrolled_course_ids": data.get("enrolled_course_ids", []),
        "accessible_resource_ids": data.get("accessible_resource_ids", []),
    }
