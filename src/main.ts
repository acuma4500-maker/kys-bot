import { Bot, webhookCallback } from "grammy";

import { registerStart } from "./commands/start";
import { registerCallbacks } from "./callbacks";

export interface Env {
  BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const bot = new Bot(env.BOT_TOKEN);

      registerStart(bot);
      registerCallbacks(bot);

      return await webhookCallback(bot, "cloudflare-mod")(request);
    } catch (err) {
      console.error(err);

      return new Response(
        err instanceof Error ? err.stack ?? err.message : String(err),
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
    }
  },
};
