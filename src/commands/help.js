export default function register(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Points Wallet helps you view your points balance and transaction history.\n\nUse /start to create or refresh your wallet profile and open the Mini App dashboard.\n\nInside the Mini App, you can see total points, earned points, spent points, latest activity, and your full transaction list."
    );
  });
}
