"""
Local models through Ollama (https://ollama.com). No key, but it has to run on the same machine:
`ollama pull llama3.2` once, then the Oracle picks it up by itself.
"""

import json
import os

import requests

from services.oracle.providers.base import (
    MAX_OUTPUT_TOKENS,
    OracleRequest,
    Provider,
    ProviderUnavailable,
)


def base_url():
    return os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")


def installed_models():
    """Names of the pulled models, or [] if Ollama isn't running."""
    try:
        # Refused connection comes back instantly, the short timeout is for a hanging host
        response = requests.get(f"{base_url()}/api/tags", timeout=0.5)
        response.raise_for_status()
        return [model["name"] for model in response.json().get("models", [])]
    except (requests.RequestException, ValueError, KeyError):
        return []


def parse_ndjson_line(line):
    """Ollama streams one JSON object per line: (text, done)."""
    if not line:
        return "", False
    try:
        chunk = json.loads(line)
    except ValueError:
        return "", False
    return chunk.get("message", {}).get("content", ""), bool(chunk.get("done"))


class OllamaProvider(Provider):
    name = "ollama"
    label = "Ollama (local model)"

    def pick_model(self):
        models = installed_models()
        wanted = os.environ.get("OLLAMA_MODEL")
        if wanted and wanted in models:
            return wanted
        return models[0] if models else None

    def is_configured(self):
        return self.pick_model() is not None

    def start(self, request: OracleRequest):
        model = self.pick_model()
        if not model:
            raise ProviderUnavailable("ollama not running or no model pulled")

        messages = [
            {"role": "system", "content": request.system_prompt},
            *request.messages,
            {"role": "system", "content": request.context_text},
        ]
        try:
            response = requests.post(
                f"{base_url()}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": True,
                    "options": {"num_predict": MAX_OUTPUT_TOKENS},
                },
                stream=True,
                # Local models can take a while to load on the first question
                timeout=(2, 180),
            )
            response.raise_for_status()
        except requests.RequestException as error:
            raise ProviderUnavailable(f"ollama failed: {error}") from error

        return self._read(response)

    def _read(self, response):
        try:
            for line in response.iter_lines(decode_unicode=True):
                text, done = parse_ndjson_line(line)
                if text:
                    yield text
                if done:
                    break
        except requests.RequestException:
            yield "\n\n(Lost the connection to Ollama, try again.)"
        finally:
            response.close()
