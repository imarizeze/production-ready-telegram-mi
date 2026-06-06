import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyTelegramInitData } from "../security/telegramWebAppAuth.js";
import { getWalletSummary, listTransactions } from "../services/walletService.js";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(currentDir, "..", "..");

function getInitData(req) {
  return String(req.get("x-telegram-init-data") || req.body?.initData || "");
}

function authenticateMiniApp(req, cfg) {
  return verifyTelegramInitData(getInitData(req), cfg.TELEGRAM_BOT_TOKEN);
}

function createWalletRoutes(app, cfg) {
  app.get("/api/wallet/summary", async (req, res) => {
    const auth = authenticateMiniApp(req, cfg);
    if (!auth.ok) {
      log.warn("api.wallet.auth.failure", { route: "/api/wallet/summary", reason: auth.error });
      return res.status(401).json({ ok: false, error: "Unable to verify Telegram session." });
    }

    try {
      const summary = await getWalletSummary(auth.user);
      return res.json({ ok: true, ...summary });
    } catch (err) {
      log.error("api.wallet.summary.failure", {
        collection: "wallets",
        operation: "GET /api/wallet/summary",
        err: safeErr(err),
      });
      return res.status(500).json({ ok: false, error: "Unable to load wallet right now." });
    }
  });

  app.get("/api/wallet/transactions", async (req, res) => {
    const auth = authenticateMiniApp(req, cfg);
    if (!auth.ok) {
      log.warn("api.wallet.auth.failure", { route: "/api/wallet/transactions", reason: auth.error });
      return res.status(401).json({ ok: false, error: "Unable to verify Telegram session." });
    }

    try {
      const limit = Number(req.query.limit || 25);
      const transactions = await listTransactions(auth.user, limit);
      return res.json({ ok: true, transactions });
    } catch (err) {
      log.error("api.wallet.transactions.failure", {
        collection: "transactions",
        operation: "GET /api/wallet/transactions",
        err: safeErr(err),
      });
      return res.status(500).json({ ok: false, error: "Unable to load transactions right now." });
    }
  });
}

function createMiniAppRoutes(app) {
  const distDir = path.join(rootDir, "webapp", "dist");
  const indexHtml = path.join(distDir, "index.html");

  function sendIndex(_req, res) {
    try {
      if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
      log.warn("miniapp.assets.missing", { pathSet: Boolean(distDir) });
      return res.status(200).send("Points Wallet web app is not built yet. Run npm run build:webapp.");
    } catch (err) {
      log.error("miniapp.serve.failure", { err: safeErr(err) });
      return res.status(500).send("Mini App is temporarily unavailable.");
    }
  }

  if (fs.existsSync(distDir)) {
    app.use("/app", express.static(distDir, {
      fallthrough: true,
      index: false,
    }));
  }

  app.get("/app", sendIndex);
  app.get("/app/*splat", sendIndex);
  app.get("/", (_req, res) => res.redirect("/app"));
}

export function createApp(cfg) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      mongodbUriSet: Boolean(cfg.MONGODB_URI),
      miniAppUrlSet: Boolean(cfg.MINI_APP_URL),
    });
  });

  createWalletRoutes(app, cfg);
  createMiniAppRoutes(app);

  app.use((err, _req, res, _next) => {
    log.error("server.request.failure", { err: safeErr(err) });
    res.status(500).json({ ok: false, error: "Request failed." });
  });

  return app;
}

export async function startServer(cfg) {
  const app = createApp(cfg);

  await new Promise((resolve, reject) => {
    const server = app.listen(cfg.PORT, () => resolve(server));
    server.on("error", (err) => {
      log.error("server.listen.failure", { err: safeErr(err), port: cfg.PORT });
      reject(err);
    });
  });

  log.info("server.started", {
    port: cfg.PORT,
    miniAppUrlSet: Boolean(cfg.MINI_APP_URL),
  });
}
