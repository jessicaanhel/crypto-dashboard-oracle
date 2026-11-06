import os

from services.oracle.providers.base import (
    OracleRequest,
    Provider,
    ProviderBusy,
    ProviderUnavailable,
)
from services.oracle.providers.claude import ClaudeProvider
from services.oracle.providers.demo import DemoProvider
from services.oracle.providers.gemini import GeminiProvider
from services.oracle.providers.ollama import OllamaProvider

PROVIDERS = {
    provider.name: provider
    for provider in (GeminiProvider(), ClaudeProvider(), OllamaProvider(), DemoProvider())
}

# Free first: Gemini free tier, then Claude if someone pays for it, then a local model
DEFAULT_ORDER = "gemini,anthropic,ollama"


def provider_chain():
    """
    Providers to try, in order. ORACLE_PROVIDERS can change the order or limit it
    (e.g. "ollama" to only use a local model). Demo is always last, so there is always an answer.
    """
    names = os.environ.get("ORACLE_PROVIDERS", DEFAULT_ORDER).split(",")
    chain = [
        PROVIDERS[name.strip()]
        for name in names
        if name.strip() in PROVIDERS and name.strip() != "demo"
    ]
    return [provider for provider in chain if provider.is_configured()] + [PROVIDERS["demo"]]


__all__ = [
    "OracleRequest",
    "Provider",
    "ProviderBusy",
    "ProviderUnavailable",
    "PROVIDERS",
    "provider_chain",
]
