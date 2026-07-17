import { Bot, webhookCallback } from "grammy";

import { registerStart } from "./commands/start";
import { registerCallbacks } from "./callbacks";

export interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {

    const bot = new Bot(env.BOT_TOKEN);

    // Komutları yükle
    registerStart(bot);

    // Butonları yükle
    registerCallbacks(bot);

    // Telegram webhook
    return webhookCallback(bot, "cloudflare-mod")(request);

  },
};
