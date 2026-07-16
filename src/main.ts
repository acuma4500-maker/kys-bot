import { bot } from "./bot.ts";

bot.command("start", async (ctx) => {
  await ctx.reply(
`🪖 Kışla Yönetim Sistemine Hoş Geldin.

Bu proje şu anda geliştiriliyor.

Yakında;

🧹 Temizlik Listesi
👷 İş Dağıtımı
📊 İstatistikler
⚙️ Yönetim Paneli

aktif olacaktır.`
  );
});

console.log("✅ Bot çalışıyor...");

bot.start();
