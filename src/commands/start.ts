import { Bot } from "grammy";

export function registerStart(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply("✅ TEST");
  });
}
