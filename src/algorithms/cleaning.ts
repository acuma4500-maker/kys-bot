import {
  BANYO_SLOTS,
  FIXED_TASKS,
  HISTORY_LIMIT,
  TASK_LABELS,
  TASK_WEIGHTS,
  TUVALET_SLOTS,
} from "../config";
import { activePeople, findPerson } from "../personnel";
import { ensureStats } from "../store";
import type { DailyPlan, StoreState, Task } from "../types";
import { TASKS } from "../types";
import { formatDateTR, todayTR } from "../utils/date";
import { bold, joinNames } from "../utils/helpers";
import { shuffle } from "../utils/random";
import { pickOda2 } from "./rotation";

/**
 * KYS — Günlük temizlik dağıtımı.
 *
 * Sıra:
 *   1) Sabit görevler (Ahmet -> Oda 1, Mertali -> Yazıhane)
 *   2) Oda 2 rotasyonu (Yusuf/Samet/Taner)
 *   3) Boş kalan sabit alanlar havuzdan adil doldurulur
 *   4) Tuvalet (3) -> Banyo (1) -> Çevre (kalan herkes)
 *
 * Adalet: ilgili alanı en az yapmış ve dün aynı alanı yapmamış
 * kişiler öncelikli; eşitlikte kura.
 */

function emptyAssignments(): Record<Task, string[]> {
  return Object.fromEntries(TASKS.map((t) => [t, []])) as Record<
    Task,
    string[]
  >;
}

function pickFair(
  state: StoreState,
  pool: readonly string[],
  task: Task,
  count: number,
): string[] {
  const scored = shuffle(pool).map((id) => ({
    id,
    repeated: state.lastTaskByPerson[id] === task ? 1 : 0,
    taskCount: ensureStats(id).tasks[task],
    score: ensureStats(id).score,
  }));
  scored.sort(
    (a, b) =>
      a.repeated - b.repeated ||
      a.taskCount - b.taskCount ||
      a.score - b.score,
  );
  return scored.slice(0, count).map((s) => s.id);
}

function applyStats(
  state: StoreState,
  plan: DailyPlan,
  direction: 1 | -1,
): void {
  for (const task of TASKS) {
    for (const id of plan.assignments[task]) {
      const stats = ensureStats(id);
      stats.total += direction;
      stats.score += TASK_WEIGHTS[task] * direction;
      stats.tasks[task] += direction;
    }
  }
}

export function distributeDaily(state: StoreState): DailyPlan {
  const date = todayTR();

  // Aynı gün yeniden dağıtım: önceki planın etkileri geri alınır.
  const previous = state.lastPlan;
  if (previous && previous.date === date) {
    applyStats(state, previous, -1);
    state.history = state.history.filter((p) => p !== previous);
    state.oda2Index = state.oda2IndexAtPlanStart;
  } else {
    state.oda2IndexAtPlanStart = state.oda2Index;
  }

  const assignments = emptyAssignments();
  const assigned = new Set<string>();
  const pool = activePeople(state.people).map((p) => p.id);

  // 1) Sabit görevler
  for (const [name, task] of FIXED_TASKS) {
    const person = findPerson(state.people, name);
    if (person && person.status === "AKTIF") {
      assignments[task].push(person.id);
      assigned.add(person.id);
    }
  }

  // 2) Oda 2 rotasyonu
  const oda2 = pickOda2(state);
  if (oda2 !== null && !assigned.has(oda2)) {
    assignments.ODA2.push(oda2);
    assigned.add(oda2);
  }

  let remaining = pool.filter((id) => !assigned.has(id));

  // 3) Boş kalan sabit alanları havuzdan doldur
  const singleSlotTasks: readonly Task[] = ["ODA1", "YAZIHANE", "ODA2"];
  for (const task of singleSlotTasks) {
    if (assignments[task].length === 0 && remaining.length > 0) {
      const picked = pickFair(state, remaining, task, 1)[0];
      if (picked) {
        assignments[task].push(picked);
        remaining = remaining.filter((id) => id !== picked);
      }
    }
  }

  // 4) Tuvalet -> Banyo -> Çevre
  const tuvalet = pickFair(state, remaining, "TUVALET", TUVALET_SLOTS);
  remaining = remaining.filter((id) => !tuvalet.includes(id));
  assignments.TUVALET.push(...tuvalet);

  const banyo = pickFair(state, remaining, "BANYO", BANYO_SLOTS);
  remaining = remaining.filter((id) => !banyo.includes(id));
  assignments.BANYO.push(...banyo);

  assignments.CEVRE.push(...remaining);

  const plan: DailyPlan = { date, assignments };

  applyStats(state, plan, 1);
  for (const task of TASKS) {
    for (const id of plan.assignments[task]) {
      state.lastTaskByPerson[id] = task;
    }
  }

  state.lastPlan = plan;
  state.history.push(plan);
  if (state.history.length > HISTORY_LIMIT) {
    state.history = state.history.slice(-HISTORY_LIMIT);
  }

  return plan;
}

/** Planın Telegram (HTML) çıktısı. */
export function planText(state: StoreState, plan: DailyPlan): string {
  const lines: string[] = [
    bold(`🧹 ${formatDateTR(plan.date)} Temizlik Dağılımı`),
    "",
  ];
  for (const task of TASKS) {
    const ids = plan.assignments[task];
    if (ids.length === 0) continue;
    const names = ids.map(
      (id) => findPerson(state.people, id)?.name ?? id,
    );
    lines.push(`${TASK_LABELS[task]} → ${joinNames(names)}`);
  }
  const inactive = state.people.filter((p) => p.status !== "AKTIF");
  if (inactive.length > 0) {
    lines.push("");
    lines.push(
      `🏠 Dağıtım dışı: ${joinNames(inactive.map((p) => p.name))}`,
    );
  }
  return lines.join("\n");
}
