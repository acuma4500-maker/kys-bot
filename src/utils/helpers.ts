/**
 * KYS — Metin yardımcıları.
 * Telegram HTML parse modu için güvenli çıktı üretir.
 */

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function bold(text: string): string {
  return `<b>${escapeHtml(text)}</b>`;
}

export function joinNames(names: readonly string[]): string {
  return names.map(escapeHtml).join(", ");
}
