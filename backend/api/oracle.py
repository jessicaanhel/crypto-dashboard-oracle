import anthropic
from flask import Blueprint, Response, jsonify, request, stream_with_context

from services.oracle import OracleInputError, OracleOfflineError, open_chat_stream

oracle_bp = Blueprint("oracle", __name__)

OFFLINE_MESSAGE = (
    "The Market Oracle is offline: the backend has no Claude API key. "
    "Set ANTHROPIC_API_KEY and restart the backend."
)


@oracle_bp.route("/api/oracle/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}

    try:
        stream, close = open_chat_stream(body.get("messages"), body.get("page"))
    except OracleInputError as error:
        return jsonify({"error": str(error)}), 400
    except (OracleOfflineError, anthropic.AuthenticationError):
        return jsonify({"error": OFFLINE_MESSAGE, "code": "no_api_key"}), 503
    except anthropic.RateLimitError:
        return jsonify({"error": "The Oracle is busy (rate limited). Try again in a minute."}), 429
    except anthropic.APIStatusError as error:
        return jsonify({"error": f"Claude API error ({error.status_code})."}), 502
    except anthropic.APIConnectionError:
        return jsonify({"error": "Could not reach the Claude API."}), 502

    def generate():
        try:
            for text in stream.text_stream:
                yield text
            final = stream.get_final_message()
            if final.stop_reason == "refusal":
                yield "\n\n(Can't help with that one.)"
            elif final.stop_reason == "max_tokens":
                yield "\n\n(Answer cut off, it got too long.)"
        except anthropic.APIError:
            yield "\n\n(Lost the connection to Claude. Try again.)"
        finally:
            close()

    # Plain text chunks; the frontend appends them as they arrive
    return Response(
        stream_with_context(generate()),
        mimetype="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
