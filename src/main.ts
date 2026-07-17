import { Bot, webhookCallback } from "grammy";
import { registerAdminCommands } from "./admin";
import { registerCallbacks } from "./callbacks";
import { registerStart } from "./commands/start";
import type { Env } from "./config";

/**
 * KYS — Cloudflare Worker giriş noktası.
 * BOT_TOKEN env'den okunur, webhook ile çalışır (long polling yok).
 */

type WebhookHandler = (request: Request) => Promise<Response>;

let cachedHandler: WebhookHandler | undefined;

function getHandler(env: Env): WebhookHandler {
  if (!cachedHandler) {
    const bot = new Bot(env.BOT_TOKEN);
    registerStart(bot);
    registerAdminCommands(bot, env);
    registerCallbacks(bot, env);
    cachedHandler = webhookCallback(bot, "cloudflare-mod");
  }
  return cachedHandler;
}

const worker: ExportedHandler<Env> = {
  async fetch(request, env) {
    // Telegram webhook POST gönderir; GET sağlık kontrolüdür.
    if (request.method !== "POST") {
      return new Response("🪖 KYS Bot çalışıyor.", { status: 200 });
    }
    try {
      return await getHandler(env)(request);
    } catch (error) {
      console.error("Webhook hatası:", error);
      // Telegram'ın aynı update'i sonsuz tekrar etmemesi için 200 dönülür.
      return new Response("OK", { status: 200 });
    }
  },
};

export default worker;
