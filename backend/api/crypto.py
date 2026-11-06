import datetime

from flask import Blueprint

from data import mock_data
from services import live_data
from services.prices import get_btc_eth_prices
from services.response import combine_sources, data_response

crypto_bp = Blueprint("crypto", __name__)


@crypto_bp.route("/api/crypto/markets")
def markets():
    data, source = live_data.get_crypto_markets()
    return data_response(data, source)


@crypto_bp.route("/api/blackrock")
def blackrock_holdings():
    btc_price, eth_price, price_source = get_btc_eth_prices()

    btc_holdings = mock_data.INSTITUTIONS["blackrock"]["btc_holdings"]
    eth_holdings = mock_data.INSTITUTIONS["blackrock"]["eth_holdings"]

    payload = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "btc_holdings": btc_holdings,
        "eth_holdings": eth_holdings,
        "btc_price_usd": btc_price,
        "eth_price_usd": eth_price,
        "btc_value_usd": btc_holdings * btc_price,
        "eth_value_usd": eth_holdings * eth_price,
    }
    return data_response(payload, combine_sources(["mock", price_source]))
