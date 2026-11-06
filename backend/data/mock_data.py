import math

INSTITUTIONS = {
    "blackrock": {
        "name": "BlackRock",
        "btc_holdings": 25000,
        "eth_holdings": 150000,
    },
}

OVERVIEW_KPIS = {
    "net_smart_money_flow_24h": 149_000_000,
    "exchange_netflow_24h": 148_000_000,
    "whale_tx_volume_24h": 224_800_000,
    "spot_etf_net_flow_week": -120_000_000,
}

INSTITUTIONAL_FLOWS = {
    "pct_freed_fair": 72,
    "new_investors": 1200,
    "btc_flow": 15300,
}

WHALE_TRANSFERS = [
    {
        "asset": "BTC",
        "qty_label": "1,200 BTC",
        "usd": 80_900_000,
        "direction": "Inflow",
        "route": "Unknown Wallet → Binance",
        "time_label": "4m ago",
    },
    {
        "asset": "ETH",
        "qty_label": "42,000 ETH",
        "usd": 133_600_000,
        "direction": "Outflow",
        "route": "Kraken → Unknown Wallet",
        "time_label": "12m ago",
    },
    {
        "asset": "USDT",
        "qty_label": "5.2M USDT",
        "usd": 5_200_000,
        "direction": "Inflow",
        "route": "Unknown Wallet → OKX",
        "time_label": "27m ago",
    },
    {
        "asset": "SOL",
        "qty_label": "18,000 SOL",
        "usd": 3_020_000,
        "direction": "Outflow",
        "route": "Coinbase → Unknown Wallet",
        "time_label": "31m ago",
    },
    {
        "asset": "PEPE",
        "qty_label": "214B PEPE",
        "usd": 2_100_000,
        "direction": "Inflow",
        "route": "Unknown Wallet → Bybit",
        "time_label": "44m ago",
    },
]

WHALE_ALERT_THRESHOLD_USD = 50_000_000

EXCHANGE_FLOWS = [
    {"exchange": "Binance", "value_musd": 182},
    {"exchange": "Coinbase", "value_musd": -64},
    {"exchange": "OKX", "value_musd": 47},
    {"exchange": "Bybit", "value_musd": 21},
    {"exchange": "Kraken", "value_musd": -38},
]

FUTURES = [
    {
        "asset": "BTC",
        "open_interest_label": "$18.4B",
        "change_24h_pct": 3.2,
        "funding_label": "0.012%",
    },
    {
        "asset": "ETH",
        "open_interest_label": "$9.1B",
        "change_24h_pct": -1.8,
        "funding_label": "-0.004%",
    },
    {
        "asset": "SOL",
        "open_interest_label": "$2.6B",
        "change_24h_pct": 8.9,
        "funding_label": "0.031%",
    },
]

_ETF_WEEKLY_MUSD = [420, 180, -95, 610, 340, -120]
ETF_FLOWS = [{"week": f"W{i + 1}", "value_musd": value} for i, value in enumerate(_ETF_WEEKLY_MUSD)]

CRYPTO_MARKETS = [
    {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price_label": "$67,420",
        "change_24h_pct": 2.4,
        "volume_label": "$28.4B",
        "market_cap_label": "$1.32T",
        "smart_flow_score": 82,
    },
    {
        "symbol": "ETH",
        "name": "Ethereum",
        "price_label": "$3,180",
        "change_24h_pct": -1.1,
        "volume_label": "$14.2B",
        "market_cap_label": "$382B",
        "smart_flow_score": 58,
    },
    {
        "symbol": "SOL",
        "name": "Solana",
        "price_label": "$168.40",
        "change_24h_pct": 5.8,
        "volume_label": "$3.1B",
        "market_cap_label": "$76B",
        "smart_flow_score": 91,
    },
    {
        "symbol": "PEPE",
        "name": "Pepe",
        "price_label": "$0.0000098",
        "change_24h_pct": 12.3,
        "volume_label": "$410M",
        "market_cap_label": "$4.1B",
        "smart_flow_score": 76,
    },
    {
        "symbol": "WIF",
        "name": "dogwifhat",
        "price_label": "$1.92",
        "change_24h_pct": -4.6,
        "volume_label": "$210M",
        "market_cap_label": "$1.9B",
        "smart_flow_score": 34,
    },
]

FIAT_PAIRS = [
    {"pair": "EUR / USD", "rate": "1.0842", "change_24h_pct": 0.12},
    {"pair": "USD / PLN", "rate": "3.982", "change_24h_pct": -0.08},
    {"pair": "EUR / PLN", "rate": "4.318", "change_24h_pct": 0.05},
    {"pair": "USD / UAH", "rate": "41.35", "change_24h_pct": 0.21},
]

PERSONAL_PNL_PLATFORMS = [
    {
        "name": "Binance",
        "type": "Exchange",
        "balance_label": "$42,180",
        "pnl_24h": 3240,
        "pnl_30d": 18920,
    },
    {
        "name": "Bybit",
        "type": "Exchange",
        "balance_label": "$11,050",
        "pnl_24h": -620,
        "pnl_30d": 2140,
    },
    {
        "name": "Revolut",
        "type": "Bank / multi-currency",
        "balance_label": "$6,300",
        "pnl_24h": 140,
        "pnl_30d": 310,
    },
    {
        "name": "Bank Account",
        "type": "Fiat savings",
        "balance_label": "$15,800",
        "pnl_24h": 32,
        "pnl_30d": 96,
    },
]

SETTINGS_CONNECTIONS = [
    {"name": "Binance", "type": "Exchange API", "status": "connected"},
    {"name": "Bybit", "type": "Exchange API", "status": "connected"},
    {"name": "Revolut", "type": "Open banking", "status": "connected"},
    {"name": "Bank account", "type": "Open banking", "status": "connected"},
    {"name": "OKX", "type": "Exchange API", "status": "not_connected"},
]

WATCHLIST = [
    {"id": 1, "asset": "BTC", "condition": "Price above $70,000", "armed": True},
    {"id": 2, "asset": "ETH", "condition": "Whale inflow > $50M / 1h", "armed": True},
    {"id": 3, "asset": "SOL", "condition": "Smart Flow Score below 60", "armed": False},
    {"id": 4, "asset": "WIF", "condition": "Price below $1.50", "armed": True},
]


def synthetic_price_series(current_price, num_days):
    prices = []
    for i in range(num_days):
        progress = i / max(num_days - 1, 1)
        wave = (
            math.sin(progress * 2 * math.pi * 1.5) * 0.05
            + math.sin(progress * 2 * math.pi * 0.5) * 0.03
        )
        drift = -0.08 * (1 - progress)
        prices.append(current_price * (1 + wave + drift))
    prices[-1] = current_price
    return prices
