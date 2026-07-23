"""
Amaanitvam Foundation — AI Doubt Support Microservice
======================================================
FastAPI entry point. Registers all routers and manages application lifespan
(database ping on startup, clean shutdown).

Run locally:
    uvicorn main:app --reload --port 8001

SRS Reference: SRS v1.2 §8 — AI Doubt Support & Platform Communication
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.chroma import init_chroma
from app.database.session import init_db

# ── Routers (stubs in Phase 1 — filled in subsequent phases) ──────────
from app.api import conversations, internal, messages, notifications

# ── Logging setup ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("ai_service")


# ── Lifespan ──────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: verify DB connection + initialise ChromaDB collection.
    Shutdown: nothing special needed (SQLAlchemy disposes engine automatically).
    """
    logger.info("Starting Amaanitvam AI Service (env=%s)", settings.ENVIRONMENT)

    # 1. Ping PostgreSQL — fails fast if DATABASE_URL is wrong
    await init_db()
    logger.info("PostgreSQL connection verified ✓")

    # 2. Initialise ChromaDB persistent client + collection
    init_chroma()
    logger.info("ChromaDB initialised at '%s' ✓", settings.CHROMA_PERSIST_DIR)

    logger.info("AI Service ready on port %s", settings.PORT)
    yield

    logger.info("AI Service shutting down.")


# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Amaanitvam AI Service",
    description=(
        "AI Doubt Support microservice for the Amaanitvam Foundation "
        "Learning Portal. Handles conversation management, RAG-based "
        "doubt resolution, content indexing, and AI notifications."
    ),
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
# Only the Node.js Main API calls this service — not the browser directly.
# Keeping CORS permissive for dev; tighten in production via env.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else [],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-Internal-Secret"],
)


# ── Global exception handler ──────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": "An unexpected error occurred.",
                "details": [],
            },
        },
    )


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(conversations.router, prefix="/api/conversations")
app.include_router(messages.router, prefix="/api/conversations")
app.include_router(notifications.router, prefix="/api/ai-notifications")
app.include_router(internal.router, prefix="/internal")


# ── Health check ──────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    """
    Public health check — no auth required.
    Returns service status, environment, and version.
    """
    return {
        "status": "ok",
        "service": "amaanitvam-ai-service",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }
