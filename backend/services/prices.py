import requests

from services.cache import cached

FALLBACK_BTC_PRICE_USD = 67_420
FALLBACK_ETH_PRICE_USD = 3_180


def get_btc_eth_prices():
    def fetch():
        price_data = requests.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
            timeout=5,
        ).json()
        return price_data["bitcoin"]["usd"], price_data["ethereum"]["usd"], "live"

    try:
        return cached("btc_eth_prices", 60, fetch)
    except (requests.RequestException, KeyError, ValueError):
        return FALLBACK_BTC_PRICE_USD, FALLBACK_ETH_PRICE_USD, "mock"
