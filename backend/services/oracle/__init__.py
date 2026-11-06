"""The Oracle: crypto chat assistant. Gemini, Claude, a local Ollama model or demo answers."""

from services.oracle.chat import (
    OracleInputError,
    active_provider,
    build_request,
    clean_messages,
    context_text,
    market_snapshot,
    start_answer,
)

__all__ = [
    "OracleInputError",
    "active_provider",
    "build_request",
    "clean_messages",
    "context_text",
    "market_snapshot",
    "start_answer",
]
