import { ODA2_ROTATION } from "../config";
import { activePeople, findPerson } from "../personnel";
import type { StoreState } from "../types";
import { shuffle } from "../utils/random";

/**
 * KYS — Rotasyon algoritmaları.
 * 1) Oda 2 sabit döngüsü (Yusuf -> Samet -> Taner -> başa).
 * 2) İş Dağıtımı: herkese sıra gelene kadar tekrar seçmeyen adil kura.
 */

/**
 * Oda 2 için sıradaki aktif kişiyi seçer ve indeksi ilerletir.
 * Sırası gelen izinliyse bir sonrakine geçilir.
 */
export function pickOda2(state: StoreState): string | null {
  const size = ODA2_ROTATION.length;
  for (let step = 0; step < size; step++) {
    const index = (state.oda2Index + step) % size;
    const name = ODA2_ROTATION[index];
    const person = name ? findPerson(state.people, name) : undefined;
    if (person && person.status === "AKTIF") {
      state.oda2Index = (index + 1) % size;
      return person.id;
    }
  }
  return null;
}

/**
 * İş Dağıtımı: aktifler arasından en az seçilmiş kişileri öne alarak
 * istenen sayıda kişi seçer. Eşitlikte kura (shuffle) devreye girer.
 * Böylece havuz bitmeden kimse ikinci kez seçilmez; tur otomatik döner.
 */
export function pickWorkers(state: StoreState, count: number): string[] {
  const pool = activePeople(state.people).map((p) => p.id);
  const scored = shuffle(pool).map((id) => ({
    id,
    picks: state.pickCounts[id] ?? 0,
  }));
  scored.sort((a, b) => a.picks - b.picks);
  const picked = scored.slice(0, count).map((s) => s.id);
  for (const id of picked) {
    state.pickCounts[id] = (state.pickCounts[id] ?? 0) + 1;
  }
  return picked;
}
