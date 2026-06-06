import { Bot } from "grammy";
import { registerCommands } from "./commands/loader.js";
import { log, safeErr } from "./lib/log.js";

export async function createBot(cfg) {
  const bot = new Bot(cfg.TELEGRAM_BOT_TOKEN);

  bot.catch((err) => {
    log.error("telegram.bot.handler.failure", {
      err: safeErr(err.error || err),
      updateId: err.ctx?.update?.update_id || null,
    });
  });

  await registerCommands(bot, cfg);

  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Create wallet and open dashboard" },
      { command: "help", description: "How to use Points Wallet" },
    ]);
  } catch (err) {
    log.warn("telegram.commands.set.failure", { err: safeErr(err) });
  }

  return bot;
}
