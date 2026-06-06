import "dotenv/config";
import { run } from "@grammyjs/runner";
import { log, safeErr } from "./lib/log.js";

process.on("unhandledRejection", (err) => {
  log.error("process.unhandledRejection", { err: safeErr(err) });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  log.error("process.uncaughtException", { err: safeErr(err) });
  process.exit(1);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let pollingStarted = false;

async function startPolling(bot) {
  if (pollingStarted) return;
  pollingStarted = true;

  let delayMs = 2000;

  while (true) {
    try {
      log.info("telegram.polling.starting");
      await bot.api.deleteWebhook({ drop_pending_updates: true });

      const runner = run(bot, {
        runner: {
          fetch: {
            allowed_updates: ["message"],
          },
          sink: {
            concurrency: 1,
          },
        },
      });

      log.info("telegram.polling.started");
      await runner.task();
      delayMs = 2000;
    } catch (err) {
      const message = safeErr(err);
      log.error("telegram.polling.failure", {
        err: message,
        conflict: message.includes("409") || message.toLowerCase().includes("conflict"),
      });
      await sleep(delayMs);
      delayMs = Math.min(delayMs * 2, 20000);
    }
  }
}

async function boot() {
  try {
    log.info("boot.start");

    const { cfg } = await import("./lib/config.js");
    log.info("config.loaded", {
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      mongodbUriSet: Boolean(cfg.MONGODB_URI),
      appBaseUrlSet: Boolean(cfg.APP_BASE_URL),
      portSet: Boolean(cfg.PORT),
    });

    if (!cfg.TELEGRAM_BOT_TOKEN) {
      log.error("config.missing", { key: "TELEGRAM_BOT_TOKEN" });
      console.error("TELEGRAM_BOT_TOKEN is required. Add it in your environment and redeploy.");
      process.exit(1);
    }

    if (!cfg.MONGODB_URI) {
      log.error("config.missing", { key: "MONGODB_URI" });
      console.error("MONGODB_URI is required for Points Wallet persistence.");
      process.exit(1);
    }

    const { connectDb, ensureIndexes } = await import("./lib/db.js");
    const { startServer } = await import("./server.js");
    const { createBot } = await import("./bot.js");

    await connectDb();
    await ensureIndexes();
    await startServer(cfg);

    const bot = await createBot(cfg);
    await bot.init();
    log.info("telegram.bot.ready", { botUsernameSet: Boolean(bot.botInfo?.username) });

    setInterval(() => {
      const m = process.memoryUsage();
      log.info("mem", {
        rssMB: Math.round(m.rss / 1e6),
        heapUsedMB: Math.round(m.heapUsed / 1e6),
      });
    }, 60000).unref();

    startPolling(bot).catch((err) => {
      log.error("telegram.polling.loop.crashed", { err: safeErr(err) });
      process.exit(1);
    });

    log.info("boot.success");
  } catch (err) {
    log.error("boot.failure", { err: safeErr(err), code: err?.code || "" });
    process.exit(1);
  }
}

boot();
