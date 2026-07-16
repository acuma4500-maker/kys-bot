// KYS — İş mantığı: temizlik listesi, iş dağıtımı, istatistik

import { AGIRLIK, ALAN_ADI, bugun, ODA2_DONGUSU } from "./config.ts";
import { type Alan, ALANLAR, type Personel, type SonListe } from "./models.ts";
import {
  aktifPersonel,
  getIsTuru,
  getOda2,
  getSonListe,
  kaydetPersoneller,
  setIsTuru,
  setOda2,
  setSonListe,
} from "./db.ts";
import { gunlukDagitim, isIcinSec } from "./algorithms.ts";

// Türkçe tarih başlığı: "17 Temmuz Cuma"
function tarihBaslik(): string {
  return new Date().toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

// ---------- Günlük temizlik listesi ----------

export async function temizlikListesiOlustur(
  yokIdler: Set<string>,
): Promise<string> {
  const tarih = bugun();
  const kadro = await aktifPersonel();
  const kisiler = new Map(kadro.map((p) => [p.id, p]));

  // Aynı gün ikinci liste → öncekinin sayaçlarını geri al, döngüyü geri sar
  const onceki = await getSonListe();
  let sonYapanOda2 = (await getOda2()).sonYapan;
  if (onceki && onceki.tarih === tarih) {
    sayaclariGeriAl(onceki, kisiler);
    const bugunku = onceki.atamalar.oda2[0];
    const i = ODA2_DONGUSU.indexOf(bugunku ?? "");
    if (i >= 0) {
      const n = ODA2_DONGUSU.length;
      sonYapanOda2 = ODA2_DONGUSU[(i + n - 1) % n];
    }
  }

  const { atamalar, oda2Yapan } = gunlukDagitim(
    kadro,
    yokIdler,
    sonYapanOda2,
    tarih,
  );

  // Sayaç + puan + son yapılma tarihi
  for (const alan of ALANLAR) {
    for (const id of atamalar[alan]) {
      const p = kisiler.get(id);
      if (!p) continue;
      p.sayaclar[alan]++;
      p.puan += AGIRLIK[alan];
      p.sonTemizlik[alan] = tarih;
    }
  }

  await kaydetPersoneller(kadro);
  if (oda2Yapan) await setOda2({ sonYapan: oda2Yapan });
  await setSonListe({ tarih, atamalar });

  return listeMesaji(atamalar, kisiler, yokIdler, kadro);
}

function sayaclariGeriAl(
  liste: SonListe,
  kisiler: Map<string, Personel>,
): void {
  for (const alan of ALANLAR) {
    for (const id of liste.atamalar[alan]) {
      const p = kisiler.get(id);
      if (!p) continue;
      p.sayaclar[alan] = Math.max(0, p.sayaclar[alan] - 1);
      p.puan = Math.max(0, p.puan - AGIRLIK[alan]);
    }
  }
}

function listeMesaji(
  atamalar: Record<Alan, string[]>,
  kisiler: Map<string, Personel>,
  yokIdler: Set<string>,
  kadro: Personel[],
): string {
  const isimler = (idler: string[]) =>
    idler.map((id) => kisiler.get(id)?.isim ?? id).join(", ") || "—";

  const satirlar = [`🧹 GÜNLÜK TEMİZLİK — ${tarihBaslik()}`, ""];
  for (const alan of ALANLAR) {
    satirlar.push(`${ALAN_ADI[alan]}: ${isimler(atamalar[alan])}`);
  }

  const yoklar = kadro
    .filter((p) => p.izinli || yokIdler.has(p.id))
    .map((p) => p.isim);
  if (yoklar.length > 0) {
    satirlar.push("", `🏠 Bugün yok: ${yoklar.join(", ")}`);
  }

  return satirlar.join("\n");
}

// ---------- Gün içi iş dağıtımı ----------

export async function isDagit(
  adet: number,
  yokIdler: Set<string>,
): Promise<string> {
  const kadro = await aktifPersonel();
  const tur = await getIsTuru();
  const { secilenler, yeniTur, turSifirlandi } = isIcinSec(
    kadro,
    yokIdler,
    tur.secilenler,
    adet,
  );

  if (secilenler.length === 0) return "⚠️ Seçilebilecek kimse yok.";

  const tarih = bugun();
  for (const p of secilenler) {
    p.isSayaci++;
    p.sonIsSecimi = tarih;
  }
  await kaydetPersoneller(secilenler);
  await setIsTuru({ secilenler: yeniTur });

  const satirlar = [
    `👷 İŞ İÇİN SEÇİLENLER (${secilenler.length} kişi)`,
    "",
    ...secilenler.map((p, i) => `${i + 1}. ${p.isim}`),
  ];
  if (turSifirlandi) satirlar.push("", "🔄 Tur tamamlandı, yeni tur başladı.");
  return satirlar.join("\n");
}

// ---------- İstatistik ----------

export async function istatistikMesaji(): Promise<string> {
  const kadro = await aktifPersonel();
  const sirali = [...kadro].sort((a, b) => b.puan - a.puan);

  const satirlar = [`📊 İSTATİSTİK — ${tarihBaslik()}`, ""];
  for (const p of sirali) {
    const s = p.sayaclar;
    const durum = p.izinli ? " 🏠" : "";
    satirlar.push(
      `${p.isim}${durum} — ⭐ ${p.puan} puan`,
      `   🚽${s.tuvalet} 🚿${s.banyo} 🌳${s.cevre} 🛏${s.oda1 + s.oda2} 📝${s.yazhane} 👷${p.isSayaci}`,
    );
  }

  const tur = await getIsTuru();
  const mevcut = kadro.filter((p) => !p.izinli);
  const kalan = mevcut.filter((p) => !tur.secilenler.includes(p.id)).length;
  satirlar.push(
    "",
    `👷 İş turu: bu turda ${tur.secilenler.length} seçim yapıldı, sırada ${kalan} kişi var.`,
  );

  return satirlar.join("\n");
}
