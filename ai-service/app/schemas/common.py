"""
Shared response envelopes used across all AI service endpoints.
SRS v1.2 §8.4 — all responses follow the project-standard format.

Success (single):
  { "success": true, "data": {...} }

Success (paginated list):
  { "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 100 } }

Error:
  { "success": false, "error": { "code": "...", "message": "...", "details": [] } }
"""

from typing import Generic, TypeVar, Any
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


# ── Pagination meta ───────────────────────────────────────────────────
class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int


# ── Success envelopes ─────────────────────────────────────────────────
class APIResponse(BaseModel, Generic[T]):
    """Single-item success response."""
    success: bool = True
    data: T

    model_config = ConfigDict(arbitrary_types_allowed=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list success response."""
    success: bool = True
    data: list[T]
    meta: PaginationMeta

    model_config = ConfigDict(arbitrary_types_allowed=True)


# ── Error detail ──────────────────────────────────────────────────────
class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[Any] = []


class APIError(BaseModel):
    """Standard error response."""
    success: bool = False
    error: ErrorDetail


# ── Error code constants ──────────────────────────────────────────────
# Centralised so routes never hardcode string literals.
class ErrorCode:
    CONVERSATION_NOT_FOUND    = "CONVERSATION_NOT_FOUND"
    CONVERSATION_ARCHIVED     = "CONVERSATION_ARCHIVED"
    MESSAGE_CONTENT_EMPTY     = "MESSAGE_CONTENT_EMPTY"
    RATE_LIMIT_EXCEEDED       = "RATE_LIMIT_EXCEEDED"
    PERMISSION_FETCH_FAILED   = "PERMISSION_FETCH_FAILED"
    LLM_UNAVAILABLE           = "LLM_UNAVAILABLE"
    INDEXING_FAILED           = "INDEXING_FAILED"
    INTERNAL_SECRET_INVALID   = "INTERNAL_SECRET_INVALID"
    NOTIFICATION_NOT_FOUND    = "NOTIFICATION_NOT_FOUND"
    VALIDATION_ERROR          = "VALIDATION_ERROR"
    SERVER_ERROR              = "SERVER_ERROR"
