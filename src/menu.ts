import { InlineKeyboard } from "grammy";
import { PICK_MAX, PICK_MIN, STATUS_LABELS } from "./config";
import type { Person } from "./types";

/**
 * KYS — Menüler.
 * Tüm InlineKeyboard'lar ve callback veri anahtarları burada.
 */

export const CB = {
  MENU_MAIN: "menu:main",
  MENU_CLEANING: "menu:cleaning",
  MENU_TASKS: "menu:tasks",
  MENU_ABSENT: "menu:absent",
  MENU_STATS: "menu:stats",
  MENU_ADMIN: "menu:admin",
  ADMIN_NEW_DAY: "admin:newday",
  ADMIN_RESET_STATS: "admin:resetstats",
  CLEANING_PERSONS: "cleaning:persons",
  /** absent:<personelId> — durum değiştirme */
  ABSENT_TOGGLE: "absent:",
  /** tasks:<sayı> — iş dağıtımı kişi sayısı */
  TASKS_PICK: "tasks:",
} as const;

const BUTTONS_PER_ROW = 2;

export function mainMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🧹 Temizlik", CB.MENU_CLEANING)
    .text("👷 İş Dağıtımı", CB.MENU_TASKS)
    .row()
    .text("🏠 Eksik Personel", CB.MENU_ABSENT)
    .text("📊 İstatistik", CB.MENU_STATS)
    .row()
    .text("⚙ Yönetim", CB.MENU_ADMIN);
}

export function backToMain(): InlineKeyboard {
  return new InlineKeyboard().text("⬅ Ana Menü", CB.MENU_MAIN);
}

/** Temizlik planı ekranı: alan bazlı görünümden kişi bazlıya geçiş. */
export function cleaningMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("👤 Kişi Bazlı", CB.CLEANING_PERSONS)
    .text("⬅ Ana Menü", CB.MENU_MAIN);
}

/** Kişi bazlı görünüm ekranı: alan bazlıya dönüş. */
export function personViewMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🧹 Alan Bazlı", CB.MENU_CLEANING)
    .text("⬅ Ana Menü", CB.MENU_MAIN);
}

export function adminMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🌅 Yeni Gün Başlat", CB.ADMIN_NEW_DAY)
    .row()
    .text("👥 Personel Durumu", CB.MENU_ABSENT)
    .row()
    .text("♻ İstatistik Sıfırla", CB.ADMIN_RESET_STATS)
    .row()
    .text("⬅ Ana Menü", CB.MENU_MAIN);
}

/** Personel listesi: isme dokununca durum değişir. */
export function absentMenu(people: Person[]): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  people.forEach((person, index) => {
    keyboard.text(
      `${person.name} ${STATUS_LABELS[person.status]}`,
      `${CB.ABSENT_TOGGLE}${person.id}`,
    );
    if (index % BUTTONS_PER_ROW === BUTTONS_PER_ROW - 1) keyboard.row();
  });
  keyboard.row().text("⬅ Ana Menü", CB.MENU_MAIN);
  return keyboard;
}

/** İş Dağıtımı: kaç kişi seçileceği. */
export function pickCountMenu(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (let n = PICK_MIN; n <= PICK_MAX; n++) {
    keyboard.text(String(n), `${CB.TASKS_PICK}${n}`);
  }
  keyboard.row().text("⬅ Ana Menü", CB.MENU_MAIN);
  return keyboard;
}

/** İş Dağıtımı sonucu: tekrar seç veya ana menü. */
export function pickResultMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔁 Tekrar Seç", CB.MENU_TASKS)
    .text("⬅ Ana Menü", CB.MENU_MAIN);
}
