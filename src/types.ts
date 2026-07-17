/**
 * KYS — Ortak tip tanımları.
 * Tüm modüller görev, personel ve durum tiplerini buradan alır.
 */

export const TASKS = [
  "ODA1",
  "ODA2",
  "YAZIHANE",
  "TUVALET",
  "BANYO",
  "CEVRE",
] as const;

export type Task = (typeof TASKS)[number];

export const STATUSES = ["AKTIF", "IZINLI", "HASTA", "GOREVLI"] as const;

export type PersonStatus = (typeof STATUSES)[number];

export interface Person {
  id: string;
  name: string;
  status: PersonStatus;
}

export type TaskCounts = Record<Task, number>;

export interface PersonStats {
  /** Toplam görev sayısı */
  total: number;
  /** Görev ağırlıklarına göre toplam puan */
  score: number;
  /** Alan bazlı görev sayaçları */
  tasks: TaskCounts;
}

export interface DailyPlan {
  /** YYYY-AA-GG (Türkiye saati) */
  date: string;
  assignments: Record<Task, string[]>;
}

export interface StoreState {
  people: Person[];
  /** Oda 2 rotasyonunda sıradaki kişinin indeksi */
  oda2Index: number;
  /** Aynı gün yeniden dağıtımda rotasyonu geri sarmak için */
  oda2IndexAtPlanStart: number;
  lastPlan: DailyPlan | null;
  /** Adalet için: kişinin en son yaptığı görev */
  lastTaskByPerson: Record<string, Task>;
  stats: Record<string, PersonStats>;
  /** İş Dağıtımı (ad-hoc seçim) sayaçları */
  pickCounts: Record<string, number>;
  history: DailyPlan[];
}
