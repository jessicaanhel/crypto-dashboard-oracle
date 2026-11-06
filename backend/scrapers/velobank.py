import re

import requests
from bs4 import BeautifulSoup


def get_velobank_rates():
    url = "https://www.velobank.pl/bankowosc-premium/kursy-walut#pieniadze"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")

    rates = {}
    for row in table.find_all("tr")[1:]:  # skip table titles
        cols = row.find_all("td")
        if len(cols) > 3:
            curr = cols[1].text.strip()
            currency = re.findall("([A-Z]+)", curr)[0]
            buy = cols[2].text.strip()
            sell = cols[3].text.strip()
            if currency in ["USD", "EUR", "PLN", "UAH"]:
                rates[currency] = {"buy": buy, "sell": sell}

    rates["PLN"] = {"buy": "1.0", "sell": "1.0"}

    return rates


if __name__ == "__main__":
    rates = get_velobank_rates()
    print(rates)
