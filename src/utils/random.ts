/**
 * KYS — Rastgelelik yardımcıları.
 * Eşit puanlı adaylar arasında adil kura için kullanılır.
 */

/** Fisher–Yates karıştırma (orijinal diziyi bozmaz). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i] as T;
    const b = result[j] as T;
    result[i] = b;
    result[j] = a;
  }
  return result;
}
