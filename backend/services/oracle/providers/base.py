"""What every Oracle backend (an LLM or the demo answers) has to implement."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Iterator

# Chat answers are short, no need for more
MAX_OUTPUT_TOKENS = 1024


class ProviderUnavailable(Exception):
    """Can't use this provider right now (no key, not running, error). The chain tries the next."""


class ProviderBusy(ProviderUnavailable):
    """Rate limited, e.g. the free daily quota is used up."""


@dataclass
class OracleRequest:
    system_prompt: str
    # [{"role": "user" | "assistant", "content": str}], last one is always the user
    messages: list
    # Live market data + current tab as text, for the LLM providers
    context_text: str
    # Same data as a dict, for the demo provider that answers from it directly
    market: dict = field(default_factory=dict)

    @property
    def question(self):
        return self.messages[-1]["content"]


class Provider(ABC):
    name = "base"
    label = "Base"

    @abstractmethod
    def is_configured(self) -> bool:
        """Cheap check whether it makes sense to try this provider at all."""

    @abstractmethod
    def start(self, request: OracleRequest) -> Iterator[str]:
        """
        Send the request and return an iterator of text chunks.

        Connection, auth and quota problems must raise ProviderUnavailable here, before the
        first chunk, so the chain can still move on to the next provider.
        """
