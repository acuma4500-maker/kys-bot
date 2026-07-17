import { Bot, InlineKeyboard, webhookCallback } from "grammy";

export interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN);

    bot.command("start", async (ctx) => {
      const keyboard = new InlineKeyboard()
        .text("🧹 Temizlik Listesi", "cleaning")
        .row()
        .text("👷 İş Dağıt", "job")
        .text("🏠 Eksik Personel", "missing")
        .row()
        .text("📊 İstatistik", "stats")
        .text("⚙️ Yönetim", "admin");

      await ctx.reply(
`🪖 *Kışla Yönetim Sistemi*

Hoş geldiniz.

Aşağıdaki menüden yapmak istediğiniz işlemi seçebilirsiniz.`,
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        }
      );
    });

    bot.callbackQuery("cleaning", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("🧹 Temizlik listesi henüz oluşturulmadı.");
    });

    bot.callbackQuery("job", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("👷 İş dağıtım sistemi hazırlanıyor.");
    });

    bot.callbackQuery("missing", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("🏠 Eksik personel sistemi hazırlanıyor.");
    });

    bot.callbackQuery("stats", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("📊 İstatistik sistemi hazırlanıyor.");
    });

    bot.callbackQuery("admin", async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.editMessageText("⚙️ Yönetim paneli hazırlanıyor.");
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
