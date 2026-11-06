import json
import ssl
from datetime import datetime

from websocket import WebSocketApp

taker = "BTC"
maker = "USDT"
pair = f"{taker.lower()}{maker.lower()}"
threshold = 100000

BINANCE_WS_URL = f"wss://stream.binance.com:9443/ws/{pair}@trade"


def on_message(ws, message):
    data = json.loads(message)
    price = float(data["p"])
    qty = float(data["q"])
    trade_operation = "*SOLD*" if data["m"] else "*BOUGHT*"
    timestamp = data["T"] / 1000  # Convert to seconds
    trade_time = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
    value_usd = price * qty

    if value_usd > threshold:  # Filter trades above the threshold
        print(
            f"{trade_operation}: {qty:.6f} BTC ({value_usd:.2f} USD) at {price:.2f} USD. Time: {trade_time}"  # noqa: E501
        )


def on_error(ws, error):
    print(f"Error: {error}")


def on_close(ws, close_status_code, close_msg):
    print("WebSocket closed")


def start_stream():
    ws = WebSocketApp(
        BINANCE_WS_URL,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})


if __name__ == "__main__":
    print(f"Listening for real-time trades on {pair.upper()}...")
    start_stream()
