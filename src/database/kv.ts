/**
 * KYS — Cloudflare KV katmanı (İLERİDE).
 *
 * Plan:
 *   - StoreState tek anahtar altında JSON olarak tutulacak.
 *   - store.ts'in arayüzü korunacak; yalnızca yükleme/kaydetme
 *     bu modüle taşınacak, diğer dosyalar değişmeyecek.
 *
 * Kurulum sırası geldiğinde:
 *   1) wrangler.toml içindeki kv_namespaces bloğu açılır.
 *   2) Env arayüzüne KYS_KV: KVNamespace eklenir.
 *   3) Her update başında loadState, sonunda saveState çağrılır.
 */

export const KV_KEYS = {
  STATE: "kys:state",
} as const;

// TODO(KV): loadState(kv: KVNamespace): Promise<StoreState>
// TODO(KV): saveState(kv: KVNamespace, state: StoreState): Promise<void>
