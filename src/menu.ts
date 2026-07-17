import { InlineKeyboard } from "grammy";

export const mainMenu = new InlineKeyboard()
  .text("🧹 Temizlik Listesi", "cleaning")
  .row()
  .text("👷 İş Dağıt", "job")
  .text("🏠 Eksik Personel", "missing")
  .row()
  .text("📊 İstatistik", "stats")
  .text("⚙️ Yönetim", "admin");
