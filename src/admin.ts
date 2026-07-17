import type { Bot, Context } from "grammy";
import { isAdmin, type Env } from "./config";
import { createPerson, findPerson } from "./personnel";
import { ensureStats, getState } from "./store";
import type { StoreState, Task } from "./types";
import { TASKS } from "./types";
import { TASK_LABELS, TASK_WEIGHTS } from "./config";
import { todayTR } from "./utils/date";

/**
 * KYS — Yönetici komutları.
 *   /ekle İsim            -> personel ekler
 *   /sil İsim             -> personel siler
 *   /degistir İsim1 İsim2 -> bugünkü planda iki kişinin görevini takas eder
 *
 * Buton tabanlı yönetici işlemleri (yeni gün, sıfırlama, durum)
 * callbacks.ts üzerinden yürür.
 */

async function requireAdmin(env: Env, ctx: Context): Promise<boolean> {
  if (isAdmin(env, ctx.from?.id)) return true;
  await ctx.reply("⛔ Bu komut yalnızca yönetici içindir.");
  return false;
}

function swapInList(list: string[], from: string, to: string): void {
  const index = list.indexOf(from);
  if (index >= 0) list[index] = to;
}

function moveStat(state: StoreState, id: string, from: Task, to: Task): void {
  const stats = ensureStats(id);
  stats.tasks[from] -= 1;
  stats.tasks[to] += 1;
  stats.score += TASK_WEIGHTS[to] - TASK_WEIGHTS[from];
}

export function registerAdminCommands(bot: Bot, env: Env): void {
  bot.command("ekle", async (ctx) => {
    if (!(await requireAdmin(env, ctx))) return;
    const name = ctx.match.trim();
    if (!name) {
      await ctx.reply("Kullanım: /ekle İsim");
      return;
    }
    const state = getState();
    if (findPerson(state.people, name)) {
      await ctx.reply("Bu isim zaten kayıtlı.");
      return;
    }
    state.people.push(createPerson(name));
    await ctx.reply(`✅ ${name} eklendi.`);
  });

  bot.command("sil", async (ctx) => {
    if (!(await requireAdmin(env, ctx))) return;
    const name = ctx.match.trim();
    if (!name) {
      await ctx.reply("Kullanım: /sil İsim");
      return;
    }
    const state = getState();
    const person = findPerson(state.people, name);
    if (!person) {
      await ctx.reply("Personel bulunamadı.");
      return;
    }
    state.people = state.people.filter((p) => p.id !== person.id);
    delete state.stats[person.id];
    delete state.pickCounts[person.id];
    delete state.lastTaskByPerson[person.id];
    await ctx.reply(`🗑 ${person.name} silindi.`);
  });

  bot.command("degistir", async (ctx) => {
    if (!(await requireAdmin(env, ctx))) return;
    const parts = ctx.match.trim().split(/\s+/).filter(Boolean);
    if (parts.length !== 2) {
      await ctx.reply("Kullanım: /degistir İsim1 İsim2");
      return;
    }
    const state = getState();
    const plan = state.lastPlan;
    if (!plan || plan.date !== todayTR()) {
      await ctx.reply("Bugün için oluşturulmuş bir plan yok.");
      return;
    }
    const first = findPerson(state.people, parts[0] ?? "");
    const second = findPerson(state.people, parts[1] ?? "");
    if (!first || !second) {
      await ctx.reply("Personel bulunamadı. İsimleri kontrol et.");
      return;
    }
    const taskA = TASKS.find((t) => plan.assignments[t].includes(first.id));
    const taskB = TASKS.find((t) => plan.assignments[t].includes(second.id));
    if (!taskA || !taskB || taskA === taskB) {
      await ctx.reply("Bu iki kişi arasında görev takası yapılamadı.");
      return;
    }
    swapInList(plan.assignments[taskA], first.id, second.id);
    swapInList(plan.assignments[taskB], second.id, first.id);
    moveStat(state, first.id, taskA, taskB);
    moveStat(state, second.id, taskB, taskA);
    state.lastTaskByPerson[first.id] = taskB;
    state.lastTaskByPerson[second.id] = taskA;
    await ctx.reply(
      `🔁 ${first.name} → ${TASK_LABELS[taskB]}, ` +
        `${second.name} → ${TASK_LABELS[taskA]}`,
    );
  });
}
