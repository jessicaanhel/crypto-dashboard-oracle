from flask import Blueprint

from data import mock_data
from services import live_data
from services.response import data_response

smart_money_bp = Blueprint("smart_money", __name__, url_prefix="/api/smart-money")


@smart_money_bp.route("/institutional")
def institutional():
    return data_response(mock_data.INSTITUTIONAL_FLOWS, "mock")


@smart_money_bp.route("/whale-transfers")
def whale_transfers():
    payload = {
        "threshold_usd": mock_data.WHALE_ALERT_THRESHOLD_USD,
        "transfers": mock_data.WHALE_TRANSFERS,
    }
    return data_response(payload, "mock")


@smart_money_bp.route("/exchange-flows")
def exchange_flows():
    return data_response(mock_data.EXCHANGE_FLOWS, "mock")


@smart_money_bp.route("/futures")
def futures():
    data, source = live_data.get_futures()
    return data_response(data, source)


@smart_money_bp.route("/etf-flows")
def etf_flows():
    return data_response(mock_data.ETF_FLOWS, "mock")
