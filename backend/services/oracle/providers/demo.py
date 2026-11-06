"""
Demo answers without any model: picks the intent from keywords and fills it with the live numbers.
Always works, so the Oracle never looks broken when there is no key and no Ollama.
"""

import re

from services.oracle.providers.base import OracleRequest, Provider

DEMO_NOTE = (
    "\n\n(Demo mode: no AI model connected. Set GEMINI_API_KEY (free) or run Ollama "
    "for real answers.)"
)

# Short explanations for the terms people ask about the most
GLOSSARY = {
    "funding": (
        "Funding rate is what longs and shorts pay each other on perpetual futures every few "
        "hours. Positive means longs pay shorts, so the market leans long; negative means the "
        "opposite."
    ),
    "open interest": (
        "Open interest is the total value of futures positions that are still open. Rising open "
        "interest with rising price usually means new money coming in, not just shorts closing."
    ),
    "smart flow": (
        "The smart flow score (0-100) on the Crypto tab sums up where the big wallets and funds "
        "are moving: 70+ is bullish, 45-70 neutral, below 45 bearish."
    ),
    "market cap": "Market cap is price times circulating supply, so it's the size of the coin.",
    "volume": "24h volume is how much of the coin was traded in the last day, in USD.",
    "etf": (
        "Spot ETFs hold the actual coins. Big inflows mean funds are buying, outflows mean they "
        "are selling, so ETF flows are a decent signal for institutional demand."
    ),
    "whale": (
        "Whales are wallets holding a lot of a coin. Big transfers to exchanges often come "
        "before selling, transfers out of exchanges usually mean holding."
    ),
}

MOVER_WORDS = ("move", "mover", "top", "best", "worst", "gain", "lose", "loser", "pump", "dump")
SUMMARY_WORDS = ("summar", "market", "today", "overview", "how is", "what's up")


def format_change(pct):
    # + 0.0 turns -0.0 into 0.0, otherwise it prints as "+-0.0%"
    pct = round(pct, 1) + 0.0
    return f"{'+' if pct >= 0 else ''}{pct:.1f}%"


def coin_line(coin):
    return (
        f"{coin['name']} ({coin['symbol']}) is at {coin['price_label']}, "
        f"{format_change(coin['change_24h_pct'])} in 24h, volume {coin['volume_label']}, "
        f"smart flow score {coin['smart_flow_score']}."
    )


def futures_line(contract):
    return (
        f"{contract['asset']} futures: open interest {contract['open_interest_label']} "
        f"({format_change(contract['change_24h_pct'])}), funding {contract['funding_label']}."
    )


def mentioned_coins(question, coins):
    found = []
    for coin in coins:
        symbol = coin["symbol"].lower()
        if re.search(rf"\b{re.escape(symbol)}\b", question) or coin["name"].lower() in question:
            found.append(coin)
    return found


def summary(coins):
    if not coins:
        return "I don't have market data right now, try again in a minute."
    up = [c for c in coins if c["change_24h_pct"] >= 0]
    lines = [coin_line(c) for c in coins]
    mood = "mostly up" if len(up) > len(coins) / 2 else "mostly down"
    return f"Market today is {mood} ({len(up)} of {len(coins)} coins green).\n" + "\n".join(lines)


def answer(question, market):
    """Plain text answer for one question, built from the market snapshot."""
    question = question.lower()
    coins = market.get("markets", {}).get("coins", [])
    futures = market.get("futures", {}).get("contracts", [])

    asked_coins = mentioned_coins(question, coins)
    if asked_coins:
        lines = [coin_line(c) for c in asked_coins]
        symbols = {c["symbol"] for c in asked_coins}
        lines += [futures_line(f) for f in futures if f["asset"] in symbols]
        return "\n".join(lines)

    if coins and any(word in question for word in MOVER_WORDS):
        ranked = sorted(coins, key=lambda c: c["change_24h_pct"], reverse=True)
        best, worst = ranked[0], ranked[-1]
        return (
            f"Biggest mover up: {best['name']} {format_change(best['change_24h_pct'])}.\n"
            f"Weakest: {worst['name']} {format_change(worst['change_24h_pct'])}."
        )

    for term, explanation in GLOSSARY.items():
        if term in question:
            if term in ("funding", "open interest") and futures:
                return explanation + "\nRight now:\n" + "\n".join(futures_line(f) for f in futures)
            return explanation

    if any(word in question for word in SUMMARY_WORDS):
        return summary(coins)

    return (
        "In demo mode I can do prices per coin, today's movers, a market summary and explain "
        "terms like funding, open interest or smart flow.\n\n" + summary(coins)
    )


class DemoProvider(Provider):
    name = "demo"
    label = "Demo answers (no AI model)"

    def is_configured(self):
        return True

    def start(self, request: OracleRequest):
        text = answer(request.question, request.market) + DEMO_NOTE
        # Word by word, so it types in the chat like the real models do
        return iter(re.findall(r"\S+\s*", text))
