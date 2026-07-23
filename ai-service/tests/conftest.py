"""
Shared pytest fixtures for the AI service test suite.

Event loop scope: "session" (set in pyproject.toml) — all async fixtures
share ONE event loop. This is required because asyncpg connections are
bound to the event loop they were created on; cross-loop usage raises
"cannot perform operation: another operation is in progress".
"""

import pytest
from unittest.mock import patch
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from sqlalchemy.pool import NullPool
from app.config import settings
from app.database.session import get_db


# ── Shared async engine (session-scoped, NullPool) ────────────────────
# NullPool: no connection reuse across tests — every request gets a fresh
# connection, preventing asyncpg 'another operation in progress' errors.

@pytest.fixture(scope="session")
def test_engine():
    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        poolclass=NullPool,
    )


@pytest.fixture(scope="session")
def TestSessionLocal(test_engine):
    return async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


# ── Shared patched app (session-scoped) ──────────────────────────────

@pytest.fixture(scope="session")
def app(TestSessionLocal):
    """FastAPI app with chromadb patched out and get_db overridden."""
    with patch("app.database.chroma.init_chroma", return_value=None):
        import main as m

        async def override_get_db():
            async with TestSessionLocal() as session:
                try:
                    yield session
                    await session.commit()
                except Exception:
                    await session.rollback()
                    raise

        m.app.dependency_overrides[get_db] = override_get_db
        yield m.app
        m.app.dependency_overrides.clear()
