import requests


def send_telegram_message(message, bot_token, chat_id):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    params = {"chat_id": chat_id, "text": message}
    requests.get(url, params=params)
    print(f"Message sent to {chat_id}: {message}")
