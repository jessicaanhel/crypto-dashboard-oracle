# Ask the Oracle

Crypto analytics dashboard: where the big money moves, what the market is doing today, and a
small chat assistant (the Oracle) you can ask about it.

React + TypeScript frontend, Flask backend. Market data comes from public APIs (CoinGecko,
Binance, Frankfurter); when a source is down the backend falls back to mock data and the UI marks
every widget as `live` or `mock`, so you allways know what you are looking at.

## Run it in 5 minutes

You need **Python 3.11+** and **Node 18+**. No API keys, no database.

```bash
git clone https://github.com/jessicaanhel/crypto-dashboard-oracle.git
cd crypto-dashboard-oracle
```

**Terminal 1, backend** (http://127.0.0.1:5000):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Terminal 2, frontend** (http://localhost:3000):

```bash
cd frontend
npm ci
npm start
```

Open **http://localhost:3000**. The frontend proxies `/api` to the backend, so there is nothing
else to configure.

On macOS `./run.sh` from the repo root opens both in two Terminal windows (after the installs).

### The Oracle

Works without any key, it then answers from the live data in demo mode. For real AI answers
set one of these before `python app.py`:

```bash
export GEMINI_API_KEY=...      # free tier, key from aistudio.google.com
export ANTHROPIC_API_KEY=...   # Claude, paid
```

Or run a local model with [Ollama](https://ollama.com) (`ollama pull llama3.2`), the backend
finds it on its own. Order it tries: Gemini → Claude → Ollama → demo, change it with
`ORACLE_PROVIDERS=ollama,gemini`.

## What you'll see

| Tab | What it shows | Data |
|---|---|---|
| Overview | Smart money KPIs, ETF flows, futures (open interest, funding) | futures live, rest mock |
| Smart Money | BlackRock BTC/ETH holdings and history, whale transfers, exchange flows | holdings priced live |
| Crypto | Prices, 24h change, volume, market cap, smart flow score | live |
| Fiat rates | EUR/USD/PLN/UAH pairs and bank buy/sell rates | live |
| Personal PnL | PnL per trading platform | mock |
| Watchlist | Price alerts you can arm/pause | mock |
| Ask the Oracle | Chat about crypto, with the live market data as context | live |

## Under the hood

- **Frontend:** React 18, TypeScript, React Router. Charts are plain SVG components, no chart
  library.
- **Backend:** Flask blueprints (routes only) → services (live data, fallbacks, cache) →
  scrapers. Every response carries an `X-Data-Source: live | mock | partial` header.
- **Oracle:** one `Provider` interface with Gemini, Claude, Ollama and demo implementations,
  tried in order until one answers (so a used up free quota just falls back). The backend adds
  current prices and futures to every question and streams the answer as plain text.
- **Quality:** pytest + Jest, black/isort/flake8/prettier via pre-commit, GitHub Actions runs the
  tests and the production build on every PR.

```
backend/   api/  services/  scrapers/  data/ (mock)  scripts/ (one-off tools)  tests/  deploy/
frontend/  src/pages/  src/components/  src/context/  src/hooks/  src/theme/
```

Running the tests:

```bash
cd backend && pip install -r requirements-dev.txt && python -m pytest
cd frontend && npm test -- --watchAll=false
```
