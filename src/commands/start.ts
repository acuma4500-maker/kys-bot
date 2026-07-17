import type { Bot } from "grammy";
import { mainMenu } from "../menu";
import { bold } from "../utils/helpers";

/**
 * KYS — /start komutu.
 * Kullanıcıyı karşılar ve ana menüyü gönderir.
 */

const WELCOME = [
  bold("🪖 Kışla Yönetim Sistemi"),
  "",
  "Günlük temizlik dağıtımı, adil iş seçimi ve istatistikler",
  "için aşağıdaki menüyü kullan.",
].join("\n");

export function registerStart(bot: Bot): void {
  bot.command("start", async (ctx) => {
    await ctx.reply(WELCOME, {
      parse_mode: "HTML",
      reply_markup: mainMenu(),
    });
  });
}
