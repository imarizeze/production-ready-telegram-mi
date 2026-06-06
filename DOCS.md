# Points Wallet Bot

Points Wallet is a Telegram Mini App bot that creates a wallet profile for each Telegram user and shows a private dashboard with points balance and transaction history.

## Commands

- /start — Creates or refreshes your wallet profile and sends a button to open the Mini App dashboard.
- /help — Explains how to use the bot and where to view balance and transaction history.

## Mini App

The Mini App is hosted by the same Node.js service at `/app`.

The bot builds the dashboard button from the configured base URL and appends `/app` in code. Use a base URL only, for example:

`APP_BASE_URL=https://your-service.onrender.com`

Do not include `/app` in the environment value.

For CookMyBots or Render deployments, `RENDER_EXTERNAL_URL` or `PUBLIC_BASE_URL` may be injected automatically. `APP_BASE_URL` is also supported and has a local development fallback of `http://localhost:4000`.

## Environment variables

- TELEGRAM_BOT_TOKEN — Required. Telegram bot token from BotFather.
- MONGODB_URI — Required. MongoDB connection string used for wallet persistence.
- APP_BASE_URL — Optional. Public base URL for the Mini App button. Defaults safely for local development.
- PUBLIC_BASE_URL — Optional. CookMyBots-managed public base URL alias.
- PORT — Optional. HTTP server port. Defaults to 4000.

The service logs only boolean environment sanity checks, never secrets or connection strings.

## Database collections

- users — Telegram identity, username, names, status, createdAt, updatedAt, and lastSeenAt.
- wallets — Current cached points balance, total earned, total spent, transaction count, createdAt, and updatedAt.
- transactions — Chronological wallet ledger records with user id, type, amount, description, status, createdAt, and updatedAt.

Indexes are created for Telegram user lookup, wallet lookup, and transaction history. The app never creates an index on `_id`.

## Mini App API

All private wallet endpoints require Telegram WebApp init data in the `x-telegram-init-data` header. The backend verifies the signature with the bot token before returning private data.

- GET /api/wallet/summary — Returns the current user's profile, points balance, totals, and latest activity.
- GET /api/wallet/transactions — Returns recent transactions for the verified user.
- GET /health — Returns a safe health status with boolean config checks.

## Local development

1. Install root dependencies:
   `npm install`

2. Install and build the web app:
   `npm run install:webapp`
   `npm run build:webapp`

3. Configure `.env` from `.env.sample`.

4. Start the single service:
   `npm start`

The service listens on `PORT` or 4000 and serves the Mini App at `/app`.

## Deployment

Set at least `TELEGRAM_BOT_TOKEN` and `MONGODB_URI`. Set `APP_BASE_URL` only if the platform does not provide a public base URL automatically.

Use the root build command:
`npm run build`

Use the start command:
`npm start`

The bot uses long polling with webhook clearing before polling starts, so it is safe for first deploys and brief deploy overlap.
