/**
 * KYS — Tarih yardımcıları.
 * Workers UTC çalışır; gün hesapları Türkiye saatine göre yapılır.
 */

const TR_TIMEZONE = "Europe/Istanbul";

/** Türkiye saatine göre bugünün tarihi: YYYY-AA-GG */
export function todayTR(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TR_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** YYYY-AA-GG -> GG.AA.YYYY */
export function formatDateTR(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}
