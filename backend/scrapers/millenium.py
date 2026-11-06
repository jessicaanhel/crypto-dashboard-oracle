import requests


def get_millennium_rates():
    url = "https://portal.api.bankmillennium.pl/bm/app/portal/views/public/fxrates/getFxRates?language=pl"  # noqa: E501
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()

    rates = {}
    for rate_group in data:
        items = rate_group.get("items", [])
        for item in items:
            currency = item.get("currency", "")
            buy = item.get("foreignExchangeBuy")
            sell = item.get("foreignExchangeSale")
            currency_code = currency.split()[0]
            if currency_code in ["USD", "EUR", "PLN", "UAH"]:
                rates[currency_code] = {"buy": buy, "sell": sell}

    rates["PLN"] = {"buy": "1.0", "sell": "1.0"}

    return rates


if __name__ == "__main__":
    rates = get_millennium_rates()
    print(rates)
