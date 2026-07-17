export interface Env {
  BOT_TOKEN: string;
  CHAT_ID: string;
  TELEGRAM_SECRET?: string;
  CHECK_URL: string;
}

export function getConfig(env: Env) {
  return {
    botToken: env.BOT_TOKEN,
    chatId: env.CHAT_ID,
    telegramSecret: env.TELEGRAM_SECRET || "",
    checkUrl: env.CHECK_URL,
  };
}
