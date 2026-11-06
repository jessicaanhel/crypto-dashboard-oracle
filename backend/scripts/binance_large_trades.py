from datetime import datetime

import requests

taker = "BTC"
maker = "USDT"
quinety = 1000000

BINANCE_API_URL = "https://api.binance.com/api/v3/trades"


def get_last_large_trades(take_coin, make_coin, large_amount=1000):
    symbol = take_coin + make_coin
    print(symbol)
    url = "https://api.binance.com/api/v3/trades"
    params = {"symbol": symbol, "limit": 100}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        trades = response.json()
        for trade in trades:
            # print(trade)
            price = float(trade["price"])
            qty = float(trade["qty"])
            trade_operation = "*SOLD*" if trade["isBuyerMaker"] else "*BOUGHT*"
            timestamp = trade["time"] / 1000  # Convert to seconds
            trade_time = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
            value_usd = price * qty
            if value_usd > large_amount:
                print(
                    f"{trade_operation}: {qty} {symbol}({value_usd} USD) in {price} USD. Timestamp: {trade_time}"  # noqa: E501
                )

    else:
        print(f"Error: {response.status_code}")


if __name__ == "__main__":
    get_last_large_trades(taker, maker)
