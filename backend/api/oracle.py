from flask import Blueprint, Response, jsonify, request, stream_with_context

from services.oracle import OracleInputError, active_provider, start_answer

oracle_bp = Blueprint("oracle", __name__)


@oracle_bp.route("/api/oracle/chat", methods=["POST"])
def chat():
    body = request.get_json(silent=True) or {}

    try:
        provider_name, chunks = start_answer(body.get("messages"), body.get("page"))
    except OracleInputError as error:
        return jsonify({"error": str(error)}), 400

    # Plain text chunks; the frontend appends them as they arrive
    return Response(
        stream_with_context(chunks),
        mimetype="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            # Which model actually answered (it can fall back, e.g. when the free quota is gone)
            "X-Oracle-Provider": provider_name,
        },
    )


@oracle_bp.route("/api/oracle/status")
def status():
    provider = active_provider()
    return jsonify(
        {"provider": provider.name, "label": provider.label, "ai": provider.name != "demo"}
    )
