export const BOT_TOKEN = Deno.env.get("8944606159:AAGkrl7bgaQXMOdg9Mi7w4PcZLMscfDSDcc");

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN bulunamadı.");
}
