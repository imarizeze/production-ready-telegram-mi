import { InlineKeyboard } from "grammy";
import { ensureWalletForTelegramUser } from "../services/walletService.js";
import { safeErr } from "../utils/errors.js";
import { log } from "../utils/logger.js";

function dashboardReplyOptions(cfg) {
  if (!cfg.MINI_APP_URL) return {};
  return {
    reply_markup: new InlineKeyboard().webApp("Open Points Dashboard", cfg.MINI_APP_URL),
  };
}

export default function register(bot, cfg) {
  bot.command("start", async (ctx) => {
    try {
      await ensureWalletForTelegramUser(ctx.from || {});

      const name = ctx.from?.first_name ? `, ${ctx.from.first_name}` : "";
      const suffix = cfg.MINI_APP_URL
        ? "Open the Mini App dashboard to view your balance and transaction history."
        : "The Mini App dashboard URL is not configured yet, but your wallet profile is ready.";

      await ctx.reply(
        `Welcome${name}.\n\nYour Points Wallet is ready. ${suffix}`,
        dashboardReplyOptions(cfg)
      );
    } catch (err) {
      log.error("command.start.failure", {
        collection: "users,wallets",
        operation: "startCommand",
        err: safeErr(err),
      });
      await ctx.reply("I could not prepare your wallet right now. Please try again in a moment.");
    }
  });
}
