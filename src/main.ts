import { Bot, webhookCallback } from "grammy";

export interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN);

    bot.command("start", async (ctx) => {
      await ctx.reply(`🪖 Kışla Yönetim Sistemine Hoş Geldin!

✅ Cloudflare Workers çalışıyor.

Yakında;

🧹 Temizlik Listesi
👷 İş Dağıtımı
📊 İstatistik
⚙️ Yönetim Paneli

aktif olacaktır.`);
    });

    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
