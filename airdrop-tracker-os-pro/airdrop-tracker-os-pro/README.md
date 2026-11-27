# Airdrop Tracker OS Pro

Dark dashboard for the Notion airdrop workspace. Includes CoinGecko market snapshots, TradingView BTC chart, CoinDesk RSS news, and read-only Notion database sync.

## Run locally

1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env`, fill `NOTION_TOKEN` and confirm the database IDs.
4. `npm start`
5. Open `http://localhost:3000`.

## Notion connection

Create an internal integration at https://www.notion.so/profile/integrations, copy its secret into `NOTION_TOKEN`, then share each of the four databases with that integration. Keep the token server-side; never put it in browser JavaScript or commit `.env`.

## Railway deployment

Deploy this folder as a Node service. Railway detects `npm start`. Add the environment variables from `.env.example` in the service Variables panel. The app listens on `process.env.PORT`.

## Current scope

- Market data: CoinGecko public markets endpoint (refreshes every 60 seconds).
- Chart: TradingView embedded BTC/USDT chart.
- News: CoinDesk RSS feed (refreshes every 15 minutes).
- Notion: read-only query of the four existing databases; records are refreshed every 5 minutes.
- Not included yet: write-back actions, automated alerts, wallet signing, seed/private-key storage.
