export const BOT_TOKEN = Deno.env.get("BOT_TOKEN");

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN bulunamadı.");
}
