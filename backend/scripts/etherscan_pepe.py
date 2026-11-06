import os
from datetime import datetime

import dotenv
import requests

dotenv.load_dotenv()

# Inputs:
COINBASE_TOKEN_ID = "pepe"
token_contract_address = "0x6982508145454Ce325dDbE47a25d4ec3d2311933"

ETHERSCAN_API = "https://api.etherscan.io/api"
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"

EXCHANGE_ADDRESSES = {
    "Binance": [
        "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
        "0x001866Ae5B3de6cAa5a51543FD9fB64f524F5478",
        "0x28C6c06298d514Db089934071355E5743bf21d60",
    ],
    "Bybit": ["0x9876...dcba"],
    "Coinbase": ["0xabcdef1234567890abcdef1234567890abcdef12"],
    "Kraken": ["iisdfj...sdfj"],
    "Bitfinex": ["0xabc...f1234567890abcdef12"],
}


def get_coin_price_in_usd():
    response = requests.get(
        COINGECKO_API, params={"ids": COINBASE_TOKEN_ID, "vs_currencies": "usd"}
    )
    data = response.json()
    return data[COINBASE_TOKEN_ID]["usd"]


def get_exchange_label(address):
    """Check if the address belongs to a known exchange and return the label."""
    for exchange, addresses in EXCHANGE_ADDRESSES.items():
        if address.lower() in [a.lower() for a in addresses]:
            return exchange
    return "Unknown"


def timestamp_to_datetime(timestamp):
    """Convert Unix timestamp to human-readable datetime."""
    return datetime.utcfromtimestamp(int(timestamp)).strftime("%Y-%m-%d %H:%M:%S")


def main():
    coin_price_usd = get_coin_price_in_usd()
    print(f"Current Pepe Price: {coin_price_usd} USD")

    params = {
        "module": "account",
        "action": "tokentx",
        "contractaddress": token_contract_address,
        "startblock": 0,
        "endblock": 99999999,
        "sort": "desc",
        "apikey": ETHERSCAN_API_KEY,
    }

    response = requests.get(ETHERSCAN_API, params=params)
    data = response.json()

    if data["status"] == "1":
        transactions = data["result"]

        top_10_transactions = transactions[:10]

        for tx in top_10_transactions:
            value_in_wei = int(tx["value"])
            value_in_pepe = value_in_wei / 10**18
            value_in_usd = value_in_pepe * coin_price_usd
            formated_price = "{:,}".format(value_in_usd).replace(",", " ")

            transaction_time = timestamp_to_datetime(tx["timeStamp"])
            if value_in_usd > 5:  # > 500,000 USD
                exchange_label = get_exchange_label(tx["to"])

                print(
                    f"*{tx['tokenSymbol']}* in ETH chain (USD {formated_price}) Transaction Hash: {tx['hash']}"  # noqa: E501
                )
                print(f"From: {tx['from']}")
                print(f"To: {tx['to']} (Public Name: {exchange_label})")
                print(f"Date and Time: {transaction_time}")
                print("=" * 50)


if __name__ == "__main__":
    main()
