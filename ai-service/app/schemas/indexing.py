"""
Indexing schemas — request bodies for the /internal/index-* endpoints.

Node.js sends these when a course or resource is created/updated.
The AI service generates an embedding and stores it in ChromaDB.
"""

from typing import Literal
from pydantic import BaseModel, Field


class IndexCourseRequest(BaseModel):
    """
    POST /internal/index-course/:courseId

    Node.js sends the fields needed to build a meaningful text representation.
    content_blocks: optional list of lesson/section text from the course
    (e.g. lesson description, content_text). These are chunked and embedded
    separately for richer RAG retrieval.
    """
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = None
    grade_level: str | None = None
    subject: str | None = None
    module_titles: list[str] = Field(
        default=[],
        description="Titles of all modules in the course",
    )
    content_blocks: list[str] = Field(
        default=[],
        description="Full text of course lessons/sections for chunked embedding",
    )


class IndexResourceRequest(BaseModel):
    """
    POST /internal/index-resource/:resourceId

    Library resource indexing. Optional content_blocks allows Node.js to
    send extracted text (e.g. PDF content) for richer semantic indexing.
    """
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = None
    subject: str | None = None
    domain: str | None = None
    grade: str | None = None
    resource_type: Literal["pdf", "video", "link", "document", "other"] | None = None
    content_blocks: list[str] = Field(
        default=[],
        description="Extracted text content from the resource for chunked embedding",
    )


class IndexResponse(BaseModel):
    """Response returned by all /internal/index-* endpoints."""
    success: bool = True
    data: dict
