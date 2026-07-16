// KYS — Adalet algoritmaları (temizlik dağıtımı + gün içi iş seçimi)

import { KONTENJAN, ODA2_DONGUSU, YAKIN_GUN_PENCERESI } from "./config.ts";
import { type Alan, bosAtamalar, type Personel } from "./models.ts";

// ---------- Yardımcılar ----------

function gunFarki(t1: string, t2: string): number {
  const ms = Math.abs(new Date(t1).getTime() - new Date(t2).getTime());
  return Math.round(ms / 86_400_000);
}

// Fisher-Yates karıştırma — eşit adaylar arasında rastgelelik sağlar
function karistir<T>(dizi: T[]): T[] {
  const d = [...dizi];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function yakindaYapti(p: Personel, alan: Alan, tarih: string): boolean {
  const son = p.sonTemizlik[alan];
  return son ? gunFarki(son, tarih) <= YAKIN_GUN_PENCERESI : false;
}

// Bir alan için en uygun `adet` kişiyi seç.
// Öncelik: son günlerde aynı işi yapmamış → bu görevi az yapmış → toplam puanı düşük → rastgele
export function alanIcinSec(
  adaylar: Personel[],
  alan: Alan,
  adet: number,
  tarih: string,
): Personel[] {
  const sirali = karistir(adaylar).sort((a, b) => {
    const aY = yakindaYapti(a, alan, tarih) ? 1 : 0;
    const bY = yakindaYapti(b, alan, tarih) ? 1 : 0;
    if (aY !== bY) return aY - bY;
    if (a.sayaclar[alan] !== b.sayaclar[alan]) {
      return a.sayaclar[alan] - b.sayaclar[alan];
    }
    return a.puan - b.puan;
  });
  return sirali.slice(0, Math.max(0, adet));
}

// 2. Oda döngüsü: son yapandan sonraki uygun kişi (izinliyse sıradaki)
export function oda2Sec(
  mevcutlar: Personel[],
  sonYapan: string | null,
): Personel | null {
  const n = ODA2_DONGUSU.length;
  const idx = sonYapan ? ODA2_DONGUSU.indexOf(sonYapan) : -1;
  const baslangic = (idx + 1) % n;
  for (let i = 0; i < n; i++) {
    const id = ODA2_DONGUSU[(baslangic + i) % n];
    const p = mevcutlar.find((x) => x.id === id);
    if (p) return p;
  }
  return null; // üçü de yok → havuzdan doldurulur
}

// ---------- Günlük temizlik dağıtımı ----------

export interface DagitimSonucu {
  atamalar: Record<Alan, string[]>;
  oda2Yapan: string | null; // döngüyü ilerletmek için (havuzdan dolduysa null)
}

export function gunlukDagitim(
  kadro: Personel[], //          aktif personel (izinliler dahil gelir, burada elenir)
  yokIdler: Set<string>, //      o sabah "yok" işaretlenenler
  sonYapanOda2: string | null,
  tarih: string,
): DagitimSonucu {
  const mevcut = kadro.filter((p) => !p.izinli && !yokIdler.has(p.id));
  const atamalar = bosAtamalar();
  const alinan = new Set<string>();

  // 1) Sabit görevler
  for (const p of mevcut) {
    if (p.sabitGorev) {
      atamalar[p.sabitGorev].push(p.id);
      alinan.add(p.id);
    }
  }

  // 2) 2. Oda döngüsü
  let oda2Yapan: string | null = null;
  const oda2Kisi = oda2Sec(
    mevcut.filter((p) => !alinan.has(p.id)),
    sonYapanOda2,
  );
  if (oda2Kisi) {
    atamalar.oda2.push(oda2Kisi.id);
    alinan.add(oda2Kisi.id);
    oda2Yapan = oda2Kisi.id;
  }

  // 3) Havuz: tuvalet + banyo + boş kalan sabit alanlar
  let havuz = mevcut.filter((p) => !alinan.has(p.id));

  const sira: [Alan, number][] = [
    ["tuvalet", KONTENJAN.tuvalet],
    ["banyo", KONTENJAN.banyo],
  ];
  for (const alan of ["oda1", "oda2", "yazhane"] as Alan[]) {
    const eksik = KONTENJAN[alan] - atamalar[alan].length;
    if (eksik > 0) sira.push([alan, eksik]); // sabit kişi yoksa havuzdan tamamlanır
  }

  for (const [alan, adet] of sira) {
    const secilen = alanIcinSec(havuz, alan, Math.min(adet, havuz.length), tarih);
    for (const p of secilen) {
      atamalar[alan].push(p.id);
      havuz = havuz.filter((x) => x.id !== p.id);
    }
  }

  // 4) Çevre: kalan herkes (eksik varsa bu alandan düşer)
  atamalar.cevre.push(...havuz.map((p) => p.id));

  return { atamalar, oda2Yapan };
}

// ---------- Gün içi iş seçimi (tur sistemi) ----------

export interface IsSecimSonucu {
  secilenler: Personel[];
  yeniTur: string[]; //     güncellenmiş tur listesi (KV'ye yazılacak)
  turSifirlandi: boolean;
}

// Herkes bir kez seçilmeden kimse ikinci kez seçilmez.
// Turda kişi yetmezse kalanlar alınır, eksik yeni turdan tamamlanır.
export function isIcinSec(
  kadro: Personel[],
  yokIdler: Set<string>,
  turdakiler: string[], // bu turda daha önce seçilmiş id'ler
  adet: number,
): IsSecimSonucu {
  const mevcut = kadro.filter((p) => !p.izinli && !yokIdler.has(p.id));
  const secilenler: Personel[] = [];
  let tur = [...turdakiler];
  let turSifirlandi = false;

  while (secilenler.length < adet) {
    let adaylar = mevcut.filter(
      (p) => !tur.includes(p.id) && !secilenler.some((s) => s.id === p.id),
    );
    if (adaylar.length === 0) {
      if (tur.length === 0) break; // seçilebilecek kimse kalmadı
      tur = [];
      turSifirlandi = true;
      adaylar = mevcut.filter((p) => !secilenler.some((s) => s.id === p.id));
      if (adaylar.length === 0) break;
    }
    // Adalet: az seçilmiş → en uzun süredir seçilmemiş → rastgele
    const sirali = karistir(adaylar).sort((a, b) =>
      a.isSayaci - b.isSayaci ||
      (a.sonIsSecimi ?? "").localeCompare(b.sonIsSecimi ?? "")
    );
    const p = sirali[0];
    secilenler.push(p);
    tur.push(p.id);
  }

  return { secilenler, yeniTur: tur, turSifirlandi };
}
