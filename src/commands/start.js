import { InlineKeyboard } from "grammy";
import { ensureWalletForTelegramUser } from "../services/wallet.js";
import { log, safeErr } from "../lib/log.js";

export default function register(bot, cfg) {
  bot.command("start", async (ctx) => {
    try {
      await ensureWalletForTelegramUser(ctx.from || {});

      const keyboard = new InlineKeyboard().webApp("Open Points Dashboard", cfg.MINI_APP_URL);
      const name = ctx.from?.first_name ? `, ${ctx.from.first_name}` : "";

      await ctx.reply(
        `Welcome${name}.\n\nYour Points Wallet is ready. Open the Mini App dashboard to view your balance and transaction history.`,
        { reply_markup: keyboard }
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
