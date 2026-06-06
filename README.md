# Points Wallet Bot

A Telegram-only Points Wallet Mini App. The bot creates or refreshes a Telegram user's wallet profile with /start, then opens a secure Mini App dashboard where the user can see their points balance and transaction history.

## Features

- Telegram bot built with grammY.
- Public commands: /start and /help.
- React, Vite, and Tailwind Mini App served at /app.
- Single Node.js service for bot polling, API routes, and web app hosting.
- MongoDB-backed users, wallets, and transactions.
- Telegram WebApp init data verification before private wallet data is returned.
- Mobile-first dashboard with loading, empty, and retryable error states.
- Production-safe logs that never print tokens, raw init data, or database credentials.

## Folder structure

- src/index.js: guarded boot entrypoint for config, MongoDB, Express, and Telegram polling.
- src/app/server.js: Express app, health check, Mini App hosting, and wallet API routes.
- src/bot.js: grammY bot wiring and command registration.
- src/commands: public Telegram command modules.
- src/lib/config.js: environment config and Mini App URL resolution.
- src/lib/db.js: shared MongoDB connection and index setup.
- src/repositories/walletRepository.js: MongoDB reads and writes for wallet data.
- src/services/walletService.js: wallet business logic used by commands and API routes.
- src/security/telegramWebAppAuth.js: Telegram WebApp init data verification.
- src/utils/errors.js: safe error extraction helper.
- src/utils/logger.js: production-safe structured logging.
- webapp/src/pages: Mini App page-level screens.
- webapp/src/components: reusable dashboard UI components.
- webapp/src/services: frontend Telegram and API helpers.
- webapp/src/styles: Tailwind and Telegram theme handling.

## Commands

- /start — Creates or refreshes the user's Points Wallet profile in MongoDB and sends a Mini App dashboard button.
- /help — Explains that users can open the Mini App to view their points balance and transaction history.

## Environment

Copy .env.sample and set:

- TELEGRAM_BOT_TOKEN — Required. Telegram bot token from BotFather.
- MONGODB_URI — Required. MongoDB connection string for users, wallets, and transactions.
- PORT — Optional. HTTP server port. Defaults to 4000.
- APP_BASE_URL — Optional. Public base URL for the Mini App button. Use a base URL only, not /app.
- PUBLIC_BASE_URL, RENDER_EXTERNAL_URL, WEBAPP_URL, WEB_APP_URL, PUBLIC_URL — Optional managed URL aliases supported for deployed Mini App hosting.

The code appends /app when building the Mini App URL.

## Local development

1. Install root dependencies:
   npm install

2. Install web app dependencies:
   npm run install:webapp

3. Build the Mini App:
   npm run build:webapp

4. Configure .env from .env.sample.

5. Start the single Node service:
   npm start

The service listens on PORT or 4000 and serves the Mini App shell at http://localhost:4000/app. Private wallet data loads only inside Telegram with valid WebApp init data.

## API routes

- GET /health — Safe health response with boolean config checks.
- GET /api/wallet/summary — Returns the verified user's profile and wallet summary.
- GET /api/wallet/transactions — Returns recent transactions for the verified user.

Wallet API routes require the x-telegram-init-data header. The backend verifies Telegram WebApp init data with TELEGRAM_BOT_TOKEN before returning private data.

## MongoDB

Collections:

- users: Telegram identity, profile names, username, status, lastSeenAt, createdAt, and updatedAt.
- wallets: cached points balance, totals, transaction count, createdAt, and updatedAt.
- transactions: wallet ledger history sorted by createdAt.

Indexes are created for telegramUserId, username, wallet userId, and transaction history. The app never creates an _id index manually.

MongoDB upserts keep createdAt in $setOnInsert only and updatedAt in $set only. Mutable user-derived fields are sanitized before $set.

## Deployment

Use one Node service.

Build command:
npm run build

Start command:
npm start

Set TELEGRAM_BOT_TOKEN and MONGODB_URI. Set APP_BASE_URL only if the platform does not inject a public base URL automatically.

The bot clears any Telegram webhook before polling and uses long polling with retry/backoff so first deploys and brief deploy overlap are handled safely.
