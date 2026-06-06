# Changelog

All notable changes to this bot project are recorded here.

## 2026-06-06 12:19:58. UTC
- Request: Arrange the code properly in folders and file according to the components
- Summary: Refactored the Telegram Points Wallet Mini App into backend repository/service/security/utils modules and frontend pages/components/services/styles while preserving /start, /help, MongoDB wallet behavior, Mini App auth,…
- Files: .env.sample, DOCS.md, README.md, package.json, src/app/server.js, src/bot.js, src/commands/help.js, src/commands/loader.js, src/commands/start.js, src/index.js, src/lib/config.js, src/lib/db.js, src/lib/log.js, src/lib/telegramAuth.js (+29 more)

## 2026-06-06 12:04:30. UTC
- Request: I want to build a mini app bot that has a wallet and a dashboard where user can see their earned points and transactions history
- Summary: Built the Telegram-only Points Wallet Mini App with MongoDB wallet persistence, verified Mini App APIs, polished dashboard UI, dedicated /start and /help commands, safe logging, and single-service startup.
- Files: .env.sample, DOCS.md, README.md, package.json, project.json, src/bot.js, src/commands/help.js, src/commands/loader.js, src/commands/start.js, src/index.js, src/lib/ai.js, src/lib/botProfile.js, src/lib/config.js, src/lib/db.js (+7 more)

