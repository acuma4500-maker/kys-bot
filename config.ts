// KYS — Ayarlar ve sabitler
//
// Deno Deploy → proje → Settings → Environment Variables:
//   BOT_TOKEN  = BotFather'dan alınan token
//   ADMIN_IDS  = yönetici Telegram chat id'leri, virgülle: "111111,222222"

import { type Alan, type Personel, yeniPersonel } from "./models.ts";

export const BOT_TOKEN = Deno.env.get("BOT_TOKEN") ?? "";

export const ADMIN_IDS: number[] = (Deno.env.get("ADMIN_IDS") ?? "")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isFinite(n) && n !== 0);

export const SABAH_CRON = "30 4 * * *"; // 04:30 UTC = 07:30 Türkiye

// Alan kontenjanları (11 kişiye göre; eksik olursa açık Çevre'den düşülür)
export const KONTENJAN: Record<Alan, number> = {
  tuvalet: 3,
  banyo: 1,
  cevre: 4,
  oda1: 1,
  oda2: 1,
  yazhane: 1,
};

// Görev ağırlıkları (toplam puan hesabı)
export const AGIRLIK: Record<Alan, number> = {
  tuvalet: 5,
  banyo: 4,
  cevre: 3,
  oda1: 2,
  oda2: 2,
  yazhane: 1,
};

export const ALAN_ADI: Record<Alan, string> = {
  tuvalet: "🚽 Tuvalet",
  banyo: "🚿 Banyo",
  cevre: "🌳 Çevre",
  oda1: "🛏 1. Oda",
  oda2: "🛏 2. Oda",
  yazhane: "📝 Yazhane",
};

// 2. Oda dönüş sırası — sırası gelen izinliyse sıradaki seçilir
export const ODA2_DONGUSU = ["yusuf", "samet", "taner"];

// "Son günlerde aynı işi yaptı mı" kontrolü için gün penceresi
export const YAKIN_GUN_PENCERESI = 2;

// KV ilk kez boşken yüklenecek kadro (sonrası ⚙️ Yönetim menüsünden yönetilir)
export const BASLANGIC_KADROSU: Personel[] = [
  yeniPersonel("cuma", "Cuma"),
  yeniPersonel("mustafa", "Mustafa"),
  yeniPersonel("ahmet", "Ahmet", "oda1"),
  yeniPersonel("mertali", "Mertali", "yazhane"),
  yeniPersonel("hasan", "Hasan"),
  yeniPersonel("huseyin", "Hüseyin"),
  yeniPersonel("mert", "Mert"),
  yeniPersonel("taner", "Taner"),
  yeniPersonel("yusuf", "Yusuf"),
  yeniPersonel("samet", "Samet"),
  yeniPersonel("ali", "Ali"),
];

// Bugünün tarihi, Türkiye saatiyle (YYYY-AA-GG)
export function bugun(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Istanbul",
  });
}

// Bugünün gün adı, Türkçe ("Cuma" gibi)
export function bugunGunAdi(): string {
  return new Date().toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
  });
}
