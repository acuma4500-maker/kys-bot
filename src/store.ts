import { createPerson, INITIAL_PERSONNEL } from "./personnel";
import type { PersonStats, StoreState, Task } from "./types";
import { TASKS } from "./types";

/**
 * KYS — Store (v1: bellek içi).
 *
 * DİKKAT: Worker yeniden başladığında bu veriler sıfırlanır.
 * Kalıcılık için sıradaki adım database/kv.ts (Cloudflare KV).
 * Arayüz bilinçli olarak basit tutuldu; KV'ye geçişte diğer
 * dosyalar değişmeden yalnızca bu modül güncellenecek.
 */

function emptyTaskCounts(): Record<Task, number> {
  return Object.fromEntries(TASKS.map((t) => [t, 0])) as Record<Task, number>;
}

function emptyStats(): PersonStats {
  return { total: 0, score: 0, tasks: emptyTaskCounts() };
}

function initialState(): StoreState {
  return {
    people: INITIAL_PERSONNEL.map(createPerson),
    oda2Index: 0,
    oda2IndexAtPlanStart: 0,
    lastPlan: null,
    lastTaskByPerson: {},
    stats: {},
    pickCounts: {},
    history: [],
  };
}

let state: StoreState = initialState();

export function getState(): StoreState {
  return state;
}

export function ensureStats(personId: string): PersonStats {
  const existing = state.stats[personId];
  if (existing) return existing;
  const created = emptyStats();
  state.stats[personId] = created;
  return created;
}

/** İstatistikleri, geçmişi ve seçim sayaçlarını sıfırlar; personel listesi korunur. */
export function resetStats(): void {
  state.stats = {};
  state.pickCounts = {};
  state.lastTaskByPerson = {};
  state.history = [];
  state.lastPlan = null;
}

/** Her şeyi fabrika ayarına döndürür (personel dahil). */
export function resetAll(): void {
  state = initialState();
}
