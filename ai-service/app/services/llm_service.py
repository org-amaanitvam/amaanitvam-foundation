"""
LLM service — builds the Gemini prompt and calls generate_content.

Extracted from chat_service.py as a separate layer per the implementation plan.
The chat_service calls this; tests can mock it independently.

Returns (response_text, token_count, latency_ms) as the plan specifies.
"""

import logging
import time

from app.config import settings
from app.models.message import Message

logger = logging.getLogger("ai_service")

CHAT_MODEL = "gemini-1.5-flash"

# System prompt — instructs Gemini to act as an academic assistant
SYSTEM_PROMPT = """You are an AI academic assistant for Amaanitvam Foundation, \
an educational organisation that provides free STEM courses and learning resources \
to students across India.

Your role:
- Answer academic doubts clearly and concisely
- Refer to the provided context (course content or library resources) when relevant
- Use simple language appropriate for the student's grade level when known
- If you are unsure about something, say so honestly rather than guessing
- Do not discuss topics unrelated to academics or the platform

Always be encouraging, patient, and supportive."""

HISTORY_WINDOW = 5   # last 5 messages sent as history (matches plan spec)


class LLMError(Exception):
    """Raised when the Gemini API call fails."""


def _get_client():
    """Return a configured google.genai Client."""
    from google import genai
    if not settings.GEMINI_API_KEY:
        raise LLMError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _build_contents(
    user_message: str,
    context_chunks: list[str],
    history: list[Message],
):
    """
    Build the Gemini contents list:
      [system+context as user turn] → [model ack] → [history] → [user message]

    Gemini 1.5 Flash doesn't support a dedicated system role in the SDK,
    so the system prompt is injected as the first user turn.
    """
    from google.genai import types

    contents = []

    # System prompt + RAG context as the opening exchange
    system_text = SYSTEM_PROMPT
    if context_chunks:
        context_block = "\n\n---\n".join(context_chunks)
        system_text += f"\n\nRELEVANT CONTENT FROM THE PLATFORM:\n{context_block}"

    contents.append(
        types.Content(role="user", parts=[types.Part(text=system_text)])
    )
    contents.append(
        types.Content(
            role="model",
            parts=[types.Part(text="Understood. I am ready to help students with their academic doubts.")],
        )
    )

    # Conversation history (last HISTORY_WINDOW messages)
    for msg in history[-HISTORY_WINDOW:]:
        gemini_role = "model" if msg.role == "assistant" else "user"
        contents.append(
            types.Content(role=gemini_role, parts=[types.Part(text=msg.content)])
        )

    # Current user message
    contents.append(
        types.Content(role="user", parts=[types.Part(text=user_message)])
    )
    return contents


async def generate_response(
    user_message: str,
    context_chunks: list[str],
    history: list[Message],
) -> tuple[str, int | None, int]:
    """
    Call Gemini and return (response_text, token_count, latency_ms).

    Args:
        user_message: The user's current question.
        context_chunks: Retrieved RAG documents (may be empty).
        history: Recent conversation messages for multi-turn context.

    Returns:
        Tuple of (ai_text, token_count, latency_ms).

    Raises:
        LLMError: If Gemini API call fails.
    """
    from google.genai import types

    client = _get_client()
    contents = _build_contents(user_message, context_chunks, history)

    t0 = time.monotonic()
    try:
        response = client.models.generate_content(
            model=CHAT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.4,         # factual, low hallucination
                max_output_tokens=1024,
                candidate_count=1,
            ),
        )
    except Exception as exc:
        logger.error("Gemini generateContent failed: %s", exc)
        raise LLMError(f"Gemini API error: {exc}") from exc

    latency_ms = int((time.monotonic() - t0) * 1000)
    ai_text = response.text or "(No response generated)"

    token_count: int | None = None
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        token_count = getattr(response.usage_metadata, "total_token_count", None)

    logger.info(
        "Gemini response: %d chars, %dms, tokens=%s", len(ai_text), latency_ms, token_count
    )
    return ai_text, token_count, latency_ms
