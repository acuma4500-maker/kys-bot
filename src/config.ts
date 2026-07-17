import type { PersonStatus, Task } from "./types";

/**
 * KYS — Yapılandırma.
 * Magic number yok: tüm sabitler burada tanımlıdır.
 */

export interface Env {
  BOT_TOKEN: string;
  ADMIN_ID: string;
}

export const TASK_LABELS: Record<Task, string> = {
  ODA1: "🚪 Oda 1",
  ODA2: "🚪 Oda 2",
  YAZIHANE: "🖊 Yazıhane",
  TUVALET: "🚽 Tuvalet",
  BANYO: "🛁 Banyo",
  CEVRE: "🌿 Çevre",
};

export const STATUS_LABELS: Record<PersonStatus, string> = {
  AKTIF: "✅",
  IZINLI: "🏠 İzinli",
  HASTA: "🤒 Hasta",
  GOREVLI: "🎖 Görevli",
};

/** Alan kontenjanları */
export const TUVALET_SLOTS = 3;
export const BANYO_SLOTS = 1;

/** Adalet puanı için görev ağırlıkları */
export const TASK_WEIGHTS: Record<Task, number> = {
  TUVALET: 5,
  BANYO: 4,
  CEVRE: 3,
  ODA1: 2,
  ODA2: 2,
  YAZIHANE: 1,
};

/** Sabit görevler: personel adı -> görev */
export const FIXED_TASKS: ReadonlyArray<readonly [string, Task]> = [
  ["Ahmet", "ODA1"],
  ["Mertali", "YAZIHANE"],
];

/** Oda 2 dönüşüm sırası (sürekli döngü) */
export const ODA2_ROTATION: readonly string[] = ["Yusuf", "Samet", "Taner"];

/** İş Dağıtımı ekranında seçilebilecek kişi sayısı aralığı */
export const PICK_MIN = 1;
export const PICK_MAX = 5;

/** Hafızada tutulacak geçmiş plan sayısı */
export const HISTORY_LIMIT = 30;

export function isAdmin(env: Env, userId: number | undefined): boolean {
  return userId !== undefined && String(userId) === env.ADMIN_ID.trim();
}
