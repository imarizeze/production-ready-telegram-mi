# Points Wallet Bot

Points Wallet is a Telegram Mini App bot that creates a wallet profile for each Telegram user and shows a private dashboard with points balance and transaction history.

## Public commands

- /start — Creates or refreshes your wallet profile in MongoDB and sends a button to open the Mini App dashboard.
- /help — Explains how to open the Mini App and view your points balance and transaction history.

No other public platform commands are implemented.

## Mini App flow

1. The user sends /start in Telegram.
2. The bot creates or refreshes the user's Points Wallet profile and wallet document.
3. The bot replies with a Mini App dashboard button.
4. The Mini App opens at /app from the same Node service.
5. The frontend sends Telegram WebApp init data in x-telegram-init-data.
6. The backend verifies the init data before returning wallet balance or transaction history.

The dashboard is mobile-first and card-based. It includes a points balance card, earned and spent totals, transaction history, loading states, empty states, and retryable error states.

## Backend structure

- src/index.js — Application entrypoint and safe boot logic.
- src/app/server.js — Express app, health route, wallet API routes, and Mini App asset serving.
- src/bot.js — grammY bot setup and command registration.
- src/commands/start.js — /start command.
- src/commands/help.js — /help command.
- src/commands/loader.js — command module loader.
- src/lib/config.js — environment and Mini App URL config.
- src/lib/db.js — MongoDB connection singleton and indexes.
- src/repositories/walletRepository.js — MongoDB persistence operations.
- src/services/walletService.js — wallet business logic.
- src/security/telegramWebAppAuth.js — Telegram WebApp init data verification.
- src/utils/errors.js — standard safe error extraction.
- src/utils/logger.js — structured production-safe logging.

## Frontend structure

- webapp/src/App.jsx — Mini App root component.
- webapp/src/pages/DashboardPage.jsx — Dashboard page state and layout.
- webapp/src/components — Reusable UI cards, lists, states, and navigation.
- webapp/src/services — Telegram WebApp and wallet API helpers.
- webapp/src/styles — Tailwind CSS and Telegram theme handling.
- webapp/src/utils — Formatting helpers.

## Environment variables

- TELEGRAM_BOT_TOKEN — Required. Used by grammY and for Telegram WebApp init data verification.
- MONGODB_URI — Required. Used for persistent wallet profiles and transaction history.
- PORT — Optional. HTTP server port. Defaults to 4000.
- APP_BASE_URL — Optional. Public base URL used for the Mini App button. Do not include /app.
- PUBLIC_BASE_URL — Optional. CookMyBots-managed base URL alias.
- RENDER_EXTERNAL_URL — Optional. Render-managed base URL alias.
- WEBAPP_URL — Optional compatibility alias.
- WEB_APP_URL — Optional compatibility alias.
- PUBLIC_URL — Optional compatibility alias.

The service logs only boolean environment sanity checks and never logs secrets, raw init data, bot tokens, or database credentials.

## MongoDB collections

- users — Telegram user profile, username, firstName, lastName, languageCode, platform, status, lastSeenAt, createdAt, and updatedAt.
- wallets — userId, pointsBalance, totalEarned, totalSpent, transactionCount, createdAt, and updatedAt.
- transactions — userId, type, amount, description, status, createdAt, and updatedAt.

Indexes are created for user lookup, wallet lookup, and transaction history. The code does not manually create an _id index.

Update safety rules are preserved. createdAt is only written in $setOnInsert during upserts. updatedAt is only written in $set. Mutable user data is sanitized before being passed to $set.

## API routes

- GET /health — Returns safe service health and boolean config checks.
- GET /api/wallet/summary — Returns the verified user's wallet summary.
- GET /api/wallet/transactions — Returns the verified user's recent transaction history.

## Local development

1. Install root dependencies:
   npm install

2. Install Mini App dependencies:
   npm run install:webapp

3. Build the Mini App:
   npm run build:webapp

4. Configure .env from .env.sample.

5. Run the single service:
   npm start

The service listens on PORT or 4000 and hosts the Mini App at /app.

## Deployment

Deploy as one Node service. Use:

Build command:
npm run build

Start command:
npm start

Set TELEGRAM_BOT_TOKEN and MONGODB_URI. APP_BASE_URL can be set to the public deployed base URL if a managed URL is not injected automatically. Store only the base URL and let the code append /app.
