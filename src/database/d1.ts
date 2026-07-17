/**
 * KYS — Cloudflare D1 katmanı (İLERİDE).
 *
 * Büyük veri (uzun görev geçmişi, audit log, aylık takvim)
 * için SQL tabanlı depolama. KV'den sonra devreye alınacak.
 *
 * Planlanan tablolar:
 *   - personnel(id, name, status)
 *   - assignments(date, task, person_id)
 *   - audit_log(ts, actor_id, action, detail)
 */

// TODO(D1): şema migration'ları ve sorgu fonksiyonları
