import datetime

from flask import Blueprint, jsonify, request

from data import mock_data
from services.prices import get_btc_eth_prices
from services.response import data_response

institutions_bp = Blueprint("institutions", __name__)


@institutions_bp.route("/api/institutions")
def institutions():
    payload = [{"id": key, "name": value["name"]} for key, value in mock_data.INSTITUTIONS.items()]
    return data_response(payload, "mock")


@institutions_bp.route("/api/institutions/<institution_id>/holdings-history")
def institution_holdings_history(institution_id):
    institution = mock_data.INSTITUTIONS.get(institution_id)
    if not institution:
        return jsonify({"error": "not found"}), 404

    period = request.args.get("period", "mtd")
    today = datetime.date.today()
    if period == "mtd":
        num_days = today.day
    elif period == "3m":
        num_days = 90
    elif period == "1y":
        num_days = 365
    else:
        return jsonify({"error": "invalid period"}), 400

    btc_price, eth_price, _price_source = get_btc_eth_prices()
    btc_series = mock_data.synthetic_price_series(btc_price, num_days)
    eth_series = mock_data.synthetic_price_series(eth_price, num_days)

    points = []
    for i in range(num_days):
        day = today - datetime.timedelta(days=num_days - 1 - i)
        points.append(
            {
                "date": day.isoformat(),
                "btc_value_usd": institution["btc_holdings"] * btc_series[i],
                "eth_value_usd": institution["eth_holdings"] * eth_series[i],
            }
        )

    payload = {"institution": institution["name"], "period": period, "points": points}
    return data_response(payload, "mock")
