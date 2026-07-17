import type { Bot, Context } from "grammy";
import { distributeDaily, planText } from "./algorithms/cleaning";
import { pickWorkers } from "./algorithms/rotation";
import { statisticsText } from "./algorithms/statistics";
import { isAdmin, TASK_LABELS, type Env } from "./config";
import {
  absentMenu,
  adminMenu,
  backToMain,
  CB,
  cleaningMenu,
  mainMenu,
  personViewMenu,
  pickCountMenu,
  pickResultMenu,
} from "./menu";
import { findPerson } from "./personnel";
import { getState, resetStats } from "./store";
import type { DailyPlan, StoreState } from "./types";
import { STATUSES, TASKS } from "./types";
import { formatDateTR, todayTR } from "./utils/date";
import { bold, escapeHtml, joinNames } from "./utils/helpers";

/**
 * KYS — Callback yönlendirici.
 * Bütün butonlar burada karşılanır, iş ilgili modüle devredilir.
 * Tek mesaj düzenleme (editMessageText) kullanılır.
 */

const TITLE = "🪖 Kışla Yönetim Sistemi";

function personViewText(state: StoreState, plan: DailyPlan): string {
  const lines: string[] = [
    bold(`👤 ${formatDateTR(plan.date)} Kişi Bazlı Görevler`),
    "",
  ];
  for (const person of state.people) {
    const task = TASKS.find((t) => plan.assignments[t].includes(person.id));
    const label = task
      ? TASK_LABELS[task]
      : person.status === "AKTIF"
        ? "—"
        : "🏠 Dağıtım dışı";
    lines.push(`${escapeHtml(person.name)}: ${label}`);
  }
  return lines.join("\n");
}

async function denyNonAdmin(ctx: Context): Promise<void> {
  await ctx.answerCallbackQuery({
    text: "⛔ Bu işlem yalnızca yönetici içindir.",
    show_alert: true,
  });
}

export function registerCallbacks(bot: Bot, env: Env): void {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const state = getState();
    const admin = isAdmin(env, ctx.from?.id);

    try {
      // ---------- Ana menü ----------
      if (data === CB.MENU_MAIN) {
        await ctx.editMessageText(bold(TITLE), {
          parse_mode: "HTML",
          reply_markup: mainMenu(),
        });

        // ---------- Temizlik ----------
      } else if (data === CB.MENU_CLEANING) {
        const plan = state.lastPlan;
        if (plan && plan.date === todayTR()) {
          await ctx.editMessageText(planText(state, plan), {
            parse_mode: "HTML",
            reply_markup: cleaningMenu(),
          });
        } else {
          await ctx.editMessageText(
            "Bugün için dağıtım henüz yapılmadı.\n" +
              'Yönetim menüsünden "🌅 Yeni Gün Başlat" ile oluşturulur.',
            { reply_markup: backToMain() },
          );
        }
      } else if (data === CB.CLEANING_PERSONS) {
        const plan = state.lastPlan;
        if (!plan) {
          await ctx.editMessageText("Henüz dağıtım yok.", {
            reply_markup: backToMain(),
          });
        } else {
          await ctx.editMessageText(personViewText(state, plan), {
            parse_mode: "HTML",
            reply_markup: personViewMenu(),
          });
        }

        // ---------- İş Dağıtımı ----------
      } else if (data === CB.MENU_TASKS) {
        await ctx.editMessageText(
          bold("👷 İş Dağıtımı") + "\n\nKaç kişi seçilsin?",
          { parse_mode: "HTML", reply_markup: pickCountMenu() },
        );
      } else if (data.startsWith(CB.TASKS_PICK)) {
        if (!admin) {
          await denyNonAdmin(ctx);
          return;
        }
        const count = Number(data.slice(CB.TASKS_PICK.length));
        if (!Number.isInteger(count) || count <= 0) return;
        const pickedIds = pickWorkers(state, count);
        const names = pickedIds.map(
          (id) => findPerson(state.people, id)?.name ?? id,
        );
        await ctx.editMessageText(
          bold("👷 Seçilenler") + "\n\n" + joinNames(names),
          { parse_mode: "HTML", reply_markup: pickResultMenu() },
        );

        // ---------- Eksik Personel ----------
      } else if (data === CB.MENU_ABSENT) {
        await ctx.editMessageText(
          bold("🏠 Personel Durumu") +
            "\n\nİsme dokunarak durumu değiştir:\n" +
            "✅ Aktif → 🏠 İzinli → 🤒 Hasta → 🎖 Görevli",
          { parse_mode: "HTML", reply_markup: absentMenu(state.people) },
        );
      } else if (data.startsWith(CB.ABSENT_TOGGLE)) {
        if (!admin) {
          await denyNonAdmin(ctx);
          return;
        }
        const id = data.slice(CB.ABSENT_TOGGLE.length);
        const person = findPerson(state.people, id);
        if (!person) return;
        const nextIndex =
          (STATUSES.indexOf(person.status) + 1) % STATUSES.length;
        person.status = STATUSES[nextIndex] ?? "AKTIF";

        // Bugünün planı varsa otomatik yeniden dağıt
        let note = "";
        if (state.lastPlan && state.lastPlan.date === todayTR()) {
          distributeDaily(state);
          note = "\n\n♻ Bugünün dağıtımı güncellendi.";
        }
        await ctx.editMessageText(
          bold("🏠 Personel Durumu") +
            "\n\nİsme dokunarak durumu değiştir." +
            note,
          { parse_mode: "HTML", reply_markup: absentMenu(state.people) },
        );

        // ---------- İstatistik ----------
      } else if (data === CB.MENU_STATS) {
        await ctx.editMessageText(statisticsText(state), {
          parse_mode: "HTML",
          reply_markup: backToMain(),
        });

        // ---------- Yönetim ----------
      } else if (data === CB.MENU_ADMIN) {
        if (!admin) {
          await denyNonAdmin(ctx);
          return;
        }
        await ctx.editMessageText(
          bold("⚙ Yönetim") +
            "\n\nKomutlar:\n" +
            "/ekle İsim — personel ekle\n" +
            "/sil İsim — personel sil\n" +
            "/degistir İsim1 İsim2 — görev takası",
          { parse_mode: "HTML", reply_markup: adminMenu() },
        );
      } else if (data === CB.ADMIN_NEW_DAY) {
        if (!admin) {
          await denyNonAdmin(ctx);
          return;
        }
        const plan = distributeDaily(state);
        await ctx.editMessageText(planText(state, plan), {
          parse_mode: "HTML",
          reply_markup: backToMain(),
        });
      } else if (data === CB.ADMIN_RESET_STATS) {
        if (!admin) {
          await denyNonAdmin(ctx);
          return;
        }
        resetStats();
        await ctx.editMessageText("♻ İstatistikler sıfırlandı.", {
          reply_markup: backToMain(),
        });
      }

      await ctx.answerCallbackQuery();
    } catch {
      // "message is not modified" gibi zararsız hatalar sessizce geçilir.
      await ctx.answerCallbackQuery().catch(() => undefined);
    }
  });
}
