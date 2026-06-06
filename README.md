# Points Wallet Bot

A production-ready Telegram Mini App bot for viewing points balances and transaction history.

## Features

- Telegram bot built with grammY.
- React, Vite, and Tailwind Mini App served at `/app`.
- Single Node.js service for bot, API, and web app hosting.
- MongoDB-backed users, wallets, and transactions.
- Telegram WebApp init data verification before private wallet data is returned.
- Mobile-first dashboard with loading, empty, and error states.

## Commands

- /start — Creates or refreshes the wallet profile and opens the dashboard.
- /help — Shows usage help.

## Environment

Copy `.env.sample` and set:

- TELEGRAM_BOT_TOKEN — Required Telegram bot token.
- MONGODB_URI — Required MongoDB connection string.
- APP_BASE_URL — Optional public base URL for the Mini App. Use a base URL only, not `/app`.
- PORT — Optional server port. Defaults to 4000.

## Run locally

1. `npm install`
2. `npm run install:webapp`
3. `npm run build:webapp`
4. `npm start`

Open `http://localhost:4000/app` for the web app shell. Private wallet data loads only inside Telegram with valid WebApp init data.

## Architecture

- `src/index.js` boots config, MongoDB, Express, and Telegram polling.
- `src/bot.js` creates the grammY bot and registers command modules.
- `src/commands` contains public bot commands.
- `src/services/wallet.js` owns wallet profile reads and writes.
- `src/server.js` serves `/app` and authenticated wallet API endpoints.
- `webapp` contains the React Mini App.

## Database

Collections:

- users
- wallets
- transactions

The wallet starts at 0 points. No fake user data is seeded.

## Deployment

Use:

- Build command: `npm run build`
- Start command: `npm start`

The service clears any Telegram webhook and starts long polling with retry/backoff. Logs include safe startup checks and database operation failures without printing secrets.
