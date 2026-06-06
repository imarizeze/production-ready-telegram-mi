import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyTelegramInitData } from "./lib/telegramAuth.js";
import { log, safeErr } from "./lib/log.js";
import { getWalletSummary, listTransactions } from "./services/wallet.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function getInitData(req) {
  return String(req.get("x-telegram-init-data") || req.body?.initData || "");
}

function authenticateMiniApp(req, cfg) {
  return verifyTelegramInitData(getInitData(req), cfg.TELEGRAM_BOT_TOKEN);
}

export async function startServer(cfg) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      mongodbUriSet: Boolean(cfg.MONGODB_URI),
    });
  });

  app.get("/api/wallet/summary", async (req, res) => {
    const auth = authenticateMiniApp(req, cfg);
    if (!auth.ok) return res.status(401).json({ ok: false, error: "Unable to verify Telegram session." });

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
    if (!auth.ok) return res.status(401).json({ ok: false, error: "Unable to verify Telegram session." });

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

  const distDir = path.join(currentDir, "..", "webapp", "dist");
  const indexHtml = path.join(distDir, "index.html");

  function sendIndex(_req, res) {
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    return res.status(200).send("Points Wallet web app is not built yet. Run npm run build:webapp.");
  }

  if (fs.existsSync(distDir)) {
    app.use("/app", express.static(distDir));
  }

  app.get("/app", sendIndex);
  app.get("/app/*splat", sendIndex);
  app.get("/", (_req, res) => res.redirect("/app"));

  await new Promise((resolve) => {
    app.listen(cfg.PORT, () => resolve(null));
  });

  log.info("server.started", {
    port: cfg.PORT,
    miniAppUrlSet: Boolean(cfg.MINI_APP_URL),
  });
}
