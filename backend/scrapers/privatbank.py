from datetime import datetime

import requests


def get_privat24_rates():
    # Get today's date in dd.mm.yyyy format
    today = datetime.now().strftime("%d.%m.%Y")
    url = f"https://api.privatbank.ua/p24api/exchange_rates?date={today}"

    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    wanted = ["USD", "EUR", "PLN", "UAH"]
    rates = {}

    for rate in data.get("exchangeRate", []):
        ccy = rate.get("currency")
        if ccy in wanted:
            buy = rate.get("purchaseRateNB") or rate.get("purchaseRate")
            sell = rate.get("saleRateNB") or rate.get("saleRate")
            rates[ccy] = {"buy": str(buy), "sell": str(sell)}

    rates["UAH"] = {"buy": "1.0", "sell": "1.0"}

    return rates


if __name__ == "__main__":
    print(get_privat24_rates())
