from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # ── Server ────────────────────────────────────────────────────────
    PORT: int = 8001
    ENVIRONMENT: str = "development"

    # ── PostgreSQL ────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── ChromaDB ─────────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # ── LLM ───────────────────────────────────────────────────────────
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "text-embedding-004"

    # ── Internal Auth ─────────────────────────────────────────────────
    INTERNAL_SHARED_SECRET: str

    # ── Main API ──────────────────────────────────────────────────────
    MAIN_API_URL: str = "http://localhost:5000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return cached Settings instance. Use as a FastAPI dependency."""
    return Settings()


# Module-level singleton for non-DI usage (e.g. database/session.py)
settings: Settings = get_settings()
