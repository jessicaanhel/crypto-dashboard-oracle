from flask import Blueprint, jsonify

from data import mock_data
from services.response import data_response

watchlist_bp = Blueprint("watchlist", __name__)


@watchlist_bp.route("/api/watchlist")
def watchlist():
    return data_response(mock_data.WATCHLIST, "mock")


@watchlist_bp.route("/api/watchlist/<int:item_id>/toggle", methods=["POST"])
def toggle(item_id):
    for item in mock_data.WATCHLIST:
        if item["id"] == item_id:
            item["armed"] = not item["armed"]
            return data_response(item, "mock")
    return jsonify({"error": "not found"}), 404
