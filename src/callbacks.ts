import { Bot } from "grammy";

export function registerCallbacks(bot: Bot) {

  bot.callbackQuery("cleaning", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("🧹 Günlük temizlik listesi yakında burada oluşturulacak.");
  });

  bot.callbackQuery("job", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("👷 İş dağıtımı yakında aktif olacak.");
  });

  bot.callbackQuery("missing", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("🏠 Eksik personel sistemi hazırlanıyor.");
  });

  bot.callbackQuery("stats", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("📊 İstatistik sistemi hazırlanıyor.");
  });

  bot.callbackQuery("admin", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("⚙️ Yönetim paneli hazırlanıyor.");
  });

}
