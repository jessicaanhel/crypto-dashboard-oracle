# BrownBro

A crypto analytics dashboard: where the big money moves, what the market does today, and a
small assistant, the Market Oracle, you can ask about any of it.

The frontend is React + TypeScript, the backend is a small Flask API that pulls public market data
and falls back to mock data when a source is down. Every response says whether it is `live`,
`mock` or `partial` (`X-Data-Source` header), and the UI shows that next to each widget, so it's
always clear what is real.

## What's inside

| Tab | What it shows | Data |
|---|---|---|
| Overview | Smart money KPIs, ETF flows, futures (open interest, funding) | futures live (Binance), rest mock |
| Smart Money | BlackRock BTC/ETH holdings and history, whale transfers, exchange flows | holdings priced live (CoinGecko) |
| Crypto | Prices, 24h change, volume, market cap, smart flow score | live (CoinGecko) |
| Fiat rates | EUR/USD/PLN/UAH pairs and bank buy/sell rates | live (Frankfurter, bank sites) |
| Personal PnL | PnL per trading platform | mock |
| Watchlist | Price alerts you can arm/pause | mock |
| Market Oracle | Chat with the crypto assistant | Claude API + live market data |

The **Market Oracle** sits in the corner of every page. It gets the same live prices and futures
data the dashboard shows, so you can ask things like "which coin moved the most today?" or "what
does a negative funding rate mean?". It sticks to crypto and doesn't give buy/sell advice.

## Stack

- **Frontend:** React 18, TypeScript, React Router, MUI theme + Emotion for global styles. Charts are plain
  SVG components, no chart library.
- **Backend:** Python 3.13, Flask, gunicorn. `requests` + BeautifulSoup for the bank scrapers,
  a small in-memory cache so we don't hit public APIs on every request.
- **Assistant:** Anthropic Claude API, streamed to the browser as plain text.
- **Tooling:** pytest, Jest, black/isort/flake8, prettier, pre-commit, GitHub Actions.

## Running it locally

```bash
pip3 install -r backend/requirements-dev.txt
cd frontend && npm install
```

Then from the repo root:

```bash
./run.sh
```

On macOS this opens two Terminal windows: the backend on http://127.0.0.1:5000 and the frontend
on http://localhost:3000 (it proxies `/api` to the backend). On other systems run them by hand:

```bash
cd backend && python3 app.py
cd frontend && npm start
```

### Environment

| Variable | Needed for | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Market Oracle | everything else works, the Oracle shows as offline |
| `ETHERSCAN_API_KEY` | `scripts/etherscan_pepe.py` only | that script fails |

Locally just `export` them before starting the backend. On the server they live in
`/etc/analytics-dashboard.env` (see below).

## Tests and code style

```bash
cd backend && python3 -m pytest
cd frontend && npm test -- --watchAll=false
```

black, isort, flake8 and prettier run through [pre-commit](https://pre-commit.com). Run
`pre-commit install` once and they run on every commit. On PRs into `develop`/`prod` the
`pre-commit` workflow fixes formatting automatically, and `CI` runs both test suites and the
production build.

## Project layout

```
backend/
  api/        Flask blueprints, one per tab, routes only
  services/   app logic: live data + fallbacks, prices, cache, Market Oracle
  scrapers/   bank exchange-rate scrapers
  data/       mock data
  scripts/    standalone tools you run by hand (Binance trades, Etherscan transfers)
  tests/
  deploy/     systemd unit for gunicorn
frontend/src/
  pages/              one file per tab
  components/UI/      shared building blocks (Card, Pill, filters, table styles)
  components/<Area>/  components that belong to one tab (SmartMoney, Crypto, Oracle, ...)
  context/ hooks/ utils/ theme/
```

`requirements.txt` has only what the server needs; `requirements-dev.txt` adds the linters,
pytest and the packages the standalone scripts use.

## Deploying

The backend runs under gunicorn as a systemd service, `backend/deploy/analytics-backend.service`
(one worker with threads, so the in-memory cache is shared and the Oracle's streamed answers don't block
other requests). It listens on `127.0.0.1:5000`, so put a reverse proxy in front that serves
`frontend/build` and forwards `/api/*` and `/refresh` to it. If the proxy buffers responses,
turn that off for `/api/oracle/chat`, otherwise the Oracle's answers arrive in one go instead of streaming.

```bash
cd frontend && npm run build
sudo systemctl restart analytics-backend
```

## Known gaps

- Overview KPIs, whale transfers, exchange flows, Personal PnL and the watchlist still use mock
  data. The plan is to wire them to Etherscan / Binance feeds (the scripts in `backend/scripts`
  are the starting point).
- The 24H/7D/30D/1Y selector in the top bar is UI only for now.
- `scrapers/pumb.py` is a stub, PUMB rates aren't in the Fiat tab yet.
