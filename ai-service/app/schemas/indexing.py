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

    Node.js sends the fields needed to build a meaningful text representation
    for embedding. We concatenate them into one document before embedding.
    """
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = None          # skill | academic | competitive | etc.
    grade_level: str | None = None       # 9 | 10 | 11 | 12 | open
    subject: str | None = None
    module_titles: list[str] = Field(
        default=[],
        description="Titles of all modules in the course",
    )


class IndexResourceRequest(BaseModel):
    """
    POST /internal/index-resource/:resourceId

    Library resource indexing. Mirrors Sourav's resource schema fields
    that are useful for semantic search.
    """
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    category: str | None = None         # textbook | notes | video | etc.
    subject: str | None = None
    domain: str | None = None
    grade: str | None = None
    resource_type: Literal["pdf", "video", "link", "document", "other"] | None = None


class IndexResponse(BaseModel):
    """Response returned by all /internal/index-* endpoints."""
    success: bool = True
    data: dict
