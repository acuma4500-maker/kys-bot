import { Bot } from "grammy";
import { createCleaningList } from "./algorithms/cleaning";

export function registerCallbacks(bot: Bot) {

  // 🧹 Temizlik Listesi
  bot.callbackQuery("cleaning", async (ctx) => {
    await ctx.answerCallbackQuery();

    const list = createCleaningList();

    await ctx.reply(
`🪖 Günlük Temizlik Listesi

🛏 Oda 1
${list.oda1}

📝 Yazıhane
${list.yazhane}

🛏 Oda 2
${list.oda2}

🚽 Tuvalet
${list.tuvalet.join("\n")}

🚿 Banyo
${list.banyo}

🌳 Çevre
${list.cevre.join("\n")}`
    );
  });

  // 👷 İş Dağıtımı
  bot.callbackQuery("job", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
`👷 İş Dağıtımı

Bu özellik yakında aktif olacak.`
    );
  });

  // 🏠 Eksik Personel
  bot.callbackQuery("missing", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
`🏠 Eksik Personel

Bu özellik yakında aktif olacak.`
    );
  });

  // 📊 İstatistik
  bot.callbackQuery("stats", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
`📊 İstatistik

Bu özellik yakında aktif olacak.`
    );
  });

  // ⚙️ Yönetim
  bot.callbackQuery("admin", async (ctx) => {
    await ctx.answerCallbackQuery();

    await ctx.reply(
`⚙️ Yönetim Paneli

Bu özellik yakında aktif olacak.`
    );
  });

}
