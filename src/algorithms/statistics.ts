import { TASK_LABELS } from "../config";
import type { StoreState } from "../types";
import { TASKS } from "../types";
import { bold } from "../utils/helpers";

/**
 * KYS — İstatistik raporu.
 * Kişi başına toplam görev, puan, iş seçimi ve alan bazlı sayaçlar.
 */

export function statisticsText(state: StoreState): string {
  if (state.people.length === 0) return "Kayıtlı personel yok.";

  const lines: string[] = [bold("📊 Görev İstatistikleri"), ""];

  const sorted = [...state.people].sort((a, b) => {
    const ta = state.stats[a.id]?.total ?? 0;
    const tb = state.stats[b.id]?.total ?? 0;
    return tb - ta || a.name.localeCompare(b.name, "tr");
  });

  for (const person of sorted) {
    const stats = state.stats[person.id];
    const total = stats?.total ?? 0;
    const score = stats?.score ?? 0;
    const picks = state.pickCounts[person.id] ?? 0;

    lines.push(
      `${bold(person.name)} — Görev: ${total} | Puan: ${score} | İş: ${picks}`,
    );

    const detail = TASKS.map((task) => ({
      task,
      count: stats?.tasks[task] ?? 0,
    }))
      .filter((entry) => entry.count > 0)
      .map((entry) => `${TASK_LABELS[entry.task]} ${entry.count}`)
      .join("  ");
    if (detail.length > 0) lines.push(detail);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}
