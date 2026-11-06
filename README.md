# Market Oracle App

Crypto analytics dashboard: where the big money moves, what the market is doing today, and a
small chat assistant (the Market Oracle) you can ask about it.

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

### Optional: the Market Oracle

The chat assistant needs an Anthropic API key. Without it the dashboard works fine and the Oracle
just shows as offline.

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # before `python app.py`
```

### If something doesn't start

- **Port 3000 is busy:** run the frontend on another port, `PORT=3001 npm start`.
- **Port 5000 is busy on macOS:** that's usually AirPlay Receiver. The backend binds to
  `127.0.0.1` so it normally still works; if not, switch AirPlay Receiver off in
  System Settings → General → AirDrop & Handoff.
- **Lots of "mock" tags:** the public APIs rate limit now and then, wait a minute and refresh.

## What you'll see

| Tab | What it shows | Data |
|---|---|---|
| Overview | Smart money KPIs, ETF flows, futures (open interest, funding) | futures live, rest mock |
| Smart Money | BlackRock BTC/ETH holdings and history, whale transfers, exchange flows | holdings priced live |
| Crypto | Prices, 24h change, volume, market cap, smart flow score | live |
| Fiat rates | EUR/USD/PLN/UAH pairs and bank buy/sell rates | live |
| Personal PnL | PnL per trading platform | mock |
| Watchlist | Price alerts you can arm/pause | mock |
| Ask the Oracle | Chat about crypto, with the live market data as context | needs API key |

## Under the hood

- **Frontend:** React 18, TypeScript, React Router. Charts are plain SVG components, no chart
  library.
- **Backend:** Flask blueprints (routes only) → services (live data, fallbacks, cache) →
  scrapers. Every response carries an `X-Data-Source: live | mock | partial` header.
- **Oracle:** streams the answer to the browser as plain text. The backend adds current prices
  and futures to each question, so answers are based on real numbers.
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
