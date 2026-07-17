import { Bot } from "grammy";
import { mainMenu } from "../menu";

export function registerStart(bot: Bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
`🪖 Kışla Yönetim Sistemi

Hoş geldiniz.

Aşağıdaki menüden bir işlem seçin.`,
      {
        reply_markup: mainMenu,
      }
    );
  });
}
