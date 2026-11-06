import datetime
import math

import requests

from data import mock_data
from services.cache import cached
from services.response import combine_sources


def format_usd_compact(value):
    abs_value = abs(value)
    sign = "-" if value < 0 else ""
    if abs_value >= 1e12:
        return f"{sign}${abs_value / 1e12:.2f}T"
    if abs_value >= 1e9:
        return f"{sign}${abs_value / 1e9:.1f}B"
    if abs_value >= 1e6:
        return f"{sign}${abs_value / 1e6:.1f}M"
    if abs_value >= 1e3:
        return f"{sign}${abs_value / 1e3:.1f}K"
    return f"{sign}${abs_value:.0f}"


def _format_price(value):
    if value >= 1000:
        return f"${value:,.0f}"
    if value >= 1:
        return f"${value:,.2f}"
    if value <= 0:
        return "$0"
    decimals = max(2, -math.floor(math.log10(value)) + 1)
    return f"${value:.{decimals}f}"


def _format_rate(value):
    text = f"{value:.4f}".rstrip("0")
    if text.endswith("."):
        text += "0"
    return text


FRANKFURTER_BASE = "https://api.frankfurter.dev/v1"


def _frankfurter_series(base, symbols):
    end = datetime.date.today()
    start = end - datetime.timedelta(days=7)
    resp = requests.get(
        f"{FRANKFURTER_BASE}/{start.isoformat()}..{end.isoformat()}",
        params={"base": base, "symbols": ",".join(symbols)},
        timeout=5,
    )
    resp.raise_for_status()
    rates_by_date = resp.json()["rates"]
    dates = sorted(rates_by_date.keys())
    return rates_by_date, dates


def get_fiat_pairs():
    def fetch():
        eur_rates, eur_dates = _frankfurter_series("EUR", ["USD", "PLN"])
        usd_rates, usd_dates = _frankfurter_series("USD", ["PLN", "UAH"])

        def pair(rates_by_date, dates, symbol, label):
            latest = rates_by_date[dates[-1]][symbol]
            prev = rates_by_date[dates[-2]][symbol] if len(dates) > 1 else latest
            change = (latest - prev) / prev * 100 if prev else 0.0
            return {"pair": label, "rate": _format_rate(latest), "change_24h_pct": round(change, 2)}

        pairs = [
            pair(eur_rates, eur_dates, "USD", "EUR / USD"),
            pair(usd_rates, usd_dates, "PLN", "USD / PLN"),
            pair(eur_rates, eur_dates, "PLN", "EUR / PLN"),
            pair(usd_rates, usd_dates, "UAH", "USD / UAH"),
        ]
        return pairs, "live"

    try:
        return cached("fiat_pairs", 6 * 3600, fetch)
    except (requests.RequestException, KeyError, IndexError, ValueError):
        return mock_data.FIAT_PAIRS, "mock"


BINANCE_FUTURES_BASE = "https://fapi.binance.com"
FUTURES_SYMBOLS = [("BTC", "BTCUSDT"), ("ETH", "ETHUSDT"), ("SOL", "SOLUSDT")]


def _fetch_binance_futures(symbol):
    oi_hist = requests.get(
        f"{BINANCE_FUTURES_BASE}/futures/data/openInterestHist",
        params={"symbol": symbol, "period": "1d", "limit": 2},
        timeout=5,
    ).json()
    funding = requests.get(
        f"{BINANCE_FUTURES_BASE}/fapi/v1/fundingRate",
        params={"symbol": symbol, "limit": 1},
        timeout=5,
    ).json()

    latest_value = float(oi_hist[-1]["sumOpenInterestValue"])
    prev_value = float(oi_hist[0]["sumOpenInterestValue"]) if len(oi_hist) > 1 else latest_value
    change_pct = ((latest_value - prev_value) / prev_value * 100) if prev_value else 0.0
    funding_rate_pct = float(funding[-1]["fundingRate"]) * 100

    return {
        "open_interest_label": format_usd_compact(latest_value),
        "change_24h_pct": round(change_pct, 1),
        "funding_label": f"{funding_rate_pct:.3f}%",
    }


def get_futures():
    def fetch():
        results = []
        for asset, symbol in FUTURES_SYMBOLS:
            try:
                data = _fetch_binance_futures(symbol)
                results.append({"asset": asset, **data, "_source": "live"})
            except (requests.RequestException, KeyError, IndexError, ValueError, TypeError):
                fallback = next(f for f in mock_data.FUTURES if f["asset"] == asset)
                results.append({**fallback, "_source": "mock"})
        return results, combine_sources([r["_source"] for r in results])

    return cached("futures", 60, fetch)


COINGECKO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "PEPE": "pepe",
    "WIF": "dogwifcoin",
}


def get_crypto_markets():
    def fetch():
        resp = requests.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            params={
                "vs_currency": "usd",
                "ids": ",".join(COINGECKO_IDS.values()),
                "price_change_percentage": "24h",
            },
            timeout=5,
        )
        resp.raise_for_status()
        by_id = {coin["id"]: coin for coin in resp.json()}

        results = []
        for mock_entry in mock_data.CRYPTO_MARKETS:
            coin = by_id.get(COINGECKO_IDS[mock_entry["symbol"]])
            if not coin:
                results.append({**mock_entry, "_source": "mock"})
                continue
            results.append(
                {
                    "symbol": mock_entry["symbol"],
                    "name": coin["name"],
                    "price_label": _format_price(coin["current_price"]),
                    "change_24h_pct": round(coin.get("price_change_percentage_24h") or 0, 1),
                    "volume_label": format_usd_compact(coin["total_volume"]),
                    "market_cap_label": format_usd_compact(coin["market_cap"]),
                    "smart_flow_score": mock_entry["smart_flow_score"],
                    "_source": "live",
                }
            )
        return results, combine_sources([r["_source"] for r in results])

    try:
        return cached("crypto_markets", 60, fetch)
    except (requests.RequestException, KeyError, ValueError):
        return [{**m, "_source": "mock"} for m in mock_data.CRYPTO_MARKETS], "mock"
