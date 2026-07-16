// KYS — Deno KV veri katmanı

import type { IsTuru, Oda2Durum, Personel, SonListe } from "./models.ts";
import { BASLANGIC_KADROSU } from "./config.ts";

const kv = await Deno.openKv();

// ---------- Personel ----------

export async function tumPersonel(): Promise<Personel[]> {
  const liste: Personel[] = [];
  for await (const e of kv.list<Personel>({ prefix: ["personel"] })) {
    liste.push(e.value);
  }
  liste.sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
  return liste;
}

// Kadroda olan herkes (izinliler dahil)
export async function aktifPersonel(): Promise<Personel[]> {
  return (await tumPersonel()).filter((p) => p.aktif);
}

export async function getPersonel(id: string): Promise<Personel | null> {
  return (await kv.get<Personel>(["personel", id])).value;
}

export async function kaydetPersonel(p: Personel): Promise<void> {
  await kv.set(["personel", p.id], p);
}

export async function kaydetPersoneller(liste: Personel[]): Promise<void> {
  for (const p of liste) await kaydetPersonel(p);
}

export async function silPersonel(id: string): Promise<void> {
  await kv.delete(["personel", id]);
}

// İlk açılışta KV boşsa başlangıç kadrosunu yükler
export async function seedGerekliyse(): Promise<boolean> {
  const isaret = await kv.get(["durum", "seed"]);
  if (isaret.value) return false;
  for (const p of BASLANGIC_KADROSU) {
    await kv.set(["personel", p.id], p);
  }
  await kv.set(["durum", "seed"], true);
  return true;
}

// ---------- Durum kayıtları ----------

// Son yapılan temizlik listesi (aynı gün ikinci listede sayaç geri almak için)
export async function getSonListe(): Promise<SonListe | null> {
  return (await kv.get<SonListe>(["durum", "sonListe"])).value;
}
export async function setSonListe(v: SonListe): Promise<void> {
  await kv.set(["durum", "sonListe"], v);
}

// Gün içi iş dağıtımı tur durumu
export async function getIsTuru(): Promise<IsTuru> {
  return (await kv.get<IsTuru>(["durum", "isTuru"])).value ?? { secilenler: [] };
}
export async function setIsTuru(v: IsTuru): Promise<void> {
  await kv.set(["durum", "isTuru"], v);
}

// 2. Oda döngüsünde en son kimin yaptığı
export async function getOda2(): Promise<Oda2Durum> {
  return (await kv.get<Oda2Durum>(["durum", "oda2"])).value ?? { sonYapan: null };
}
export async function setOda2(v: Oda2Durum): Promise<void> {
  await kv.set(["durum", "oda2"], v);
}

// ---------- Geçici durum (buton akışları için, 1 saat ömürlü) ----------

export async function setGecici(anahtar: string, deger: unknown): Promise<void> {
  await kv.set(["gecici", anahtar], deger, { expireIn: 1000 * 60 * 60 });
}

export async function getGecici<T>(anahtar: string): Promise<T | null> {
  return (await kv.get<T>(["gecici", anahtar])).value;
}
