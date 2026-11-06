"""Google Gemini over the REST API. Has a free tier, a key from aistudio.google.com is enuogh."""

import json
import os

import requests

from services.oracle.providers.base import (
    MAX_OUTPUT_TOKENS,
    OracleRequest,
    Provider,
    ProviderBusy,
    ProviderUnavailable,
)

STREAM_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent"

# Alias Google keeps pointing at the current Flash model, so this doesn't go stale
DEFAULT_MODEL = "gemini-flash-latest"


def to_gemini_contents(messages):
    # Gemini calls the assistant "model"
    return [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in messages
    ]


def parse_sse_line(line):
    """Text from one 'data: {...}' line of the stream, or '' for anything else."""
    if not line or not line.startswith("data:"):
        return ""
    try:
        chunk = json.loads(line[len("data:") :])
    except ValueError:
        return ""

    candidates = chunk.get("candidates") or []
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(part.get("text", "") for part in parts if not part.get("thought"))


class GeminiProvider(Provider):
    name = "gemini"
    label = "Google Gemini"

    def api_key(self):
        return os.environ.get("GEMINI_API_KEY", "").strip()

    def model(self):
        return os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)

    def is_configured(self):
        return bool(self.api_key())

    def start(self, request: OracleRequest):
        body = {
            # No system role inside "contents" on Gemini, so the live context goes here too
            "systemInstruction": {
                "parts": [{"text": request.system_prompt + "\n\n" + request.context_text}]
            },
            "contents": to_gemini_contents(request.messages),
            "generationConfig": {"maxOutputTokens": MAX_OUTPUT_TOKENS},
        }
        try:
            response = requests.post(
                STREAM_URL.format(model=self.model()),
                params={"alt": "sse"},
                headers={"x-goog-api-key": self.api_key()},
                json=body,
                stream=True,
                timeout=(5, 60),
            )
        except requests.RequestException as error:
            raise ProviderUnavailable(f"gemini not reachable: {error}") from error

        if response.status_code == 429:
            response.close()
            raise ProviderBusy("gemini quota used up")
        if response.status_code != 200:
            response.close()
            raise ProviderUnavailable(f"gemini returned {response.status_code}")

        return self._read(response)

    def _read(self, response):
        try:
            for line in response.iter_lines(decode_unicode=True):
                text = parse_sse_line(line)
                if text:
                    yield text
        except requests.RequestException:
            yield "\n\n(Lost the connection to Gemini, try again.)"
        finally:
            response.close()
