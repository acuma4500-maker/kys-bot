// KYS — Tip tanımları ve fabrika fonksiyonları

export type Alan = "tuvalet" | "banyo" | "cevre" | "oda1" | "oda2" | "yazhane";

export const ALANLAR: Alan[] = [
  "tuvalet",
  "banyo",
  "cevre",
  "oda1",
  "oda2",
  "yazhane",
];

export type Rol = "admin" | "kullanici";

export interface Personel {
  id: string; //                                 benzersiz kısa ad: "cuma", "mertali"
  isim: string; //                               görünen isim: "Cuma"
  aktif: boolean; //                             false → kadrodan çıkarıldı
  rol: Rol;
  sabitGorev: Alan | null; //                    "oda1" / "yazhane" / null
  izinli: boolean; //                            izin / revir / görevde
  sonTemizlik: Partial<Record<Alan, string>>; // alan → en son yaptığı tarih (YYYY-AA-GG)
  sonIsSecimi: string | null; //                 en son iş için seçildiği tarih
  sayaclar: Record<Alan, number>; //             alan bazlı temizlik sayaçları
  isSayaci: number; //                           gün içi iş seçimi sayacı
  puan: number; //                               ağırlıklı toplam puan
}

export interface SonListe {
  tarih: string; //                    YYYY-AA-GG
  atamalar: Record<Alan, string[]>; // alan → personel id'leri
}

export interface IsTuru {
  secilenler: string[]; // bu turda seçilmiş personel id'leri
}

export interface Oda2Durum {
  sonYapan: string | null; // "yusuf" | "samet" | "taner"
}

export function bosSayaclar(): Record<Alan, number> {
  return { tuvalet: 0, banyo: 0, cevre: 0, oda1: 0, oda2: 0, yazhane: 0 };
}

export function bosAtamalar(): Record<Alan, string[]> {
  return { tuvalet: [], banyo: [], cevre: [], oda1: [], oda2: [], yazhane: [] };
}

export function yeniPersonel(
  id: string,
  isim: string,
  sabitGorev: Alan | null = null,
): Personel {
  return {
    id,
    isim,
    aktif: true,
    rol: "kullanici",
    sabitGorev,
    izinli: false,
    sonTemizlik: {},
    sonIsSecimi: null,
    sayaclar: bosSayaclar(),
    isSayaci: 0,
    puan: 0,
  };
}
