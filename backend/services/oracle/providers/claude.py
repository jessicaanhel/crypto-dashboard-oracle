"""Claude through the Anthropic SDK (paid, needs ANTHROPIC_API_KEY)."""

import os

import anthropic

from services.oracle.providers.base import (
    OracleRequest,
    Provider,
    ProviderBusy,
    ProviderUnavailable,
)

MODEL = "claude-opus-5-5"

# Short chat answers, low effort keeps them quick and cheap
EFFORT = "low"
MAX_TOKENS = 8000

# If a safety classifier declines, the API retries on a fallback model by itself
FALLBACK_BETA = "server-side-fallback-2026-07-01"


class ClaudeProvider(Provider):
    name = "anthropic"
    label = "Anthropic Claude"

    def is_configured(self):
        return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())

    def start(self, request: OracleRequest):
        messages = [
            *request.messages,
            # Volatile data last, after the cached system prompt and history
            {"role": "system", "content": request.context_text},
        ]
        stream_manager = anthropic.Anthropic().beta.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=[
                {
                    "type": "text",
                    "text": request.system_prompt,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=messages,
            output_config={"effort": EFFORT},
            betas=[FALLBACK_BETA],
            fallbacks="default",
        )
        try:
            stream = stream_manager.__enter__()
        except TypeError as error:
            # The SDK raises a plain TypeError when it finds no key at all
            raise ProviderUnavailable(f"no anthropic credentials: {error}") from error
        except anthropic.RateLimitError as error:
            raise ProviderBusy("anthropic rate limited") from error
        except anthropic.APIError as error:
            raise ProviderUnavailable(f"anthropic failed: {error}") from error

        return self._read(stream, stream_manager)

    def _read(self, stream, stream_manager):
        try:
            for text in stream.text_stream:
                yield text
            final = stream.get_final_message()
            if final.stop_reason == "refusal":
                yield "\n\n(Can't help with that one.)"
            elif final.stop_reason == "max_tokens":
                yield "\n\n(Answer cut off, it got too long.)"
        except anthropic.APIError:
            yield "\n\n(Lost the connection to Claude, try again.)"
        finally:
            stream_manager.__exit__(None, None, None)
