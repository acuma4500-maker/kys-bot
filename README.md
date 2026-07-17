# 🪖 Kışla Yönetim Sistemi (KYS Bot)

Telegram üzerinden çalışan, tamamen ücretsiz koğuş yönetim sistemi.
TypeScript + Cloudflare Workers + grammY. Webhook ile çalışır.

## Özellikler (v1)

- 🧹 Günlük temizlik dağıtımı (sabit görevler + Oda 2 rotasyonu + adil kura)
- 👷 İş Dağıtımı: 1-5 kişilik adil seçim (herkese sıra gelmeden tekrar yok)
- 🏠 Eksik personel: İzinli / Hasta / Görevli işaretleme, otomatik yeniden dağıtım
- 📊 İstatistik: kişi başına görev sayısı, puan, alan bazlı sayaçlar
- ⚙ Yönetim: yeni gün başlat, istatistik sıfırla, /ekle /sil /degistir

## Kurulum (telefondan)

1. **GitHub:** Bu dosyaları `kys-bot` reposuna yükle
   (eski Deno dosyaları varsa hepsini sil, bu yapı gelsin).

2. **Cloudflare:** Dashboard → Workers & Pages → Create →
   **Import a repository** → `kys-bot` seç → Deploy.
   Build komutu otomatik (`npx wrangler deploy`), ayar gerekmez.

3. **Secrets:** Worker → Settings → Variables and Secrets:
   - `BOT_TOKEN` → BotFather token'ı (Secret)
   - `ADMIN_ID` → senin Telegram kullanıcı ID'n (Secret)

   Ekledikten sonra bir kez **Retry deployment** yap.

4. **Webhook:** Tarayıcıda şu adresi aç (kendi bilgilerinle):

   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://kys-bot.<hesap>.workers.dev
   ```

   `{"ok":true,...}` görürsen tamamdır. Bota `/start` yaz.

## Komutlar

| Komut | Açıklama |
|---|---|
| `/start` | Ana menüyü açar |
| `/ekle İsim` | Personel ekler (admin) |
| `/sil İsim` | Personel siler (admin) |
| `/degistir İsim1 İsim2` | Bugünkü planda görev takası (admin) |

## Önemli Not (v1)

Veriler şimdilik **bellek içinde** tutulur. Worker bir süre boşta kalıp
yeniden başlarsa istatistikler ve durumlar sıfırlanır (personel listesi
koddan geri yüklenir). Kalıcılık için sıradaki adım: **Cloudflare KV**
(`src/database/kv.ts` bunun için hazır bekliyor).

## Dosya Yapısı

```
src/
  main.ts          → Worker girişi, webhook
  callbacks.ts     → Bütün butonlar
  menu.ts          → InlineKeyboard'lar
  config.ts        → Sabitler, Env, görev ağırlıkları
  store.ts         → Bellek içi durum (ileride KV)
  personnel.ts     → Personel listesi ve yardımcılar
  admin.ts         → Yönetici komutları
  types.ts         → Ortak tipler
  commands/start.ts
  algorithms/
    cleaning.ts    → Günlük dağıtım algoritması
    rotation.ts    → Oda 2 döngüsü + adil iş seçimi
    statistics.ts  → İstatistik raporu
  database/
    kv.ts, d1.ts   → İleride
  utils/
    date.ts, random.ts, helpers.ts
```
