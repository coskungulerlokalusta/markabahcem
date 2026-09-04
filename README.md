# markabahçem 🌿

> "markabahçem — karmaşa yok, sadece bildiğin markalar."

Trendyol gibi platformlarda herkesin dükkân açabilmesi karmaşa ve güven
sorunu yaratıyor. **markabahçem**, sadece gerçek, bilinen, köklü markaların
(Beymen, Vakko, Koton, Adil Işık, Altınyıldız Classics, LC Waikiki, Arçelik,
Media Markt, Zara, H&M, Atasay, Atasun Optik, Starbucks, Kahve Dünyası gibi)
yer aldığı, kürasyonlu, çok-markalı bir alışveriş platformu fikridir
(Farfetch benzeri bir model: markalar kendi ürününü listeler, kendi
kargosunu gönderir, platform sadece komisyon alır).

## ⚠️ Bu bir statik demo/prototiptir

Bu repo **tamamen istemci taraflı (client-side)** çalışan bir HTML/CSS/JS
prototipidir. Gerçek bir backend, veritabanı ya da ödeme altyapısı **yoktur**.

- `js/static-api.js`, tarayıcının `window.fetch()` fonksiyonunu override
  ederek `/api/...` isteklerine sahte cevaplar üretir.
- Tüm "veritabanı" tarayıcının **localStorage**'ında tutulur
  (anahtar: `markabahcem_static_db`).
- Sonuç olarak veriler **sadece o an kullandığınız tarayıcı/cihazda**
  görünür. Farklı bir cihaz/tarayıcı sitesi sıfırdan (seed) veriyle başlar.
  İki farklı kullanıcı birbirinin sepetini, siparişini ya da yüklediği
  logoyu **asla göremez**.
- Demoyu sıfırlamak için tarayıcı konsoluna `resetMarkabahcemDemo()` yazın.

Gerçek, çok kullanıcılı bir platforma dönüştürmek için bu mimarinin
(localStorage + fetch override) yerine gerçek bir backend + veritabanı +
gerçek ödeme entegrasyonu (iyzico Pazaryeri / PayTR Pazaryeri gibi
sub-merchant destekli bir sağlayıcı) konması gerekir.

## Sayfalar

| Dosya | Açıklama |
|---|---|
| `index.html` | Ana sayfa |
| `category.html` | Kategoriye göre ürün listeleme + filtreler |
| `product.html` | Ürün detay sayfası |
| `search.html` | Arama sonuçları |
| `favorites.html` | Favoriler |
| `checkout.html` | Sepet → adres → ödeme → onay (gerçek ödeme yok) |
| `login.html` | Müşteri girişi/kaydı (demo) |
| `store-profile.html` | Mağaza vitrin sayfası |
| `partner-apply.html` | Marka/mağaza başvuru formu |
| `partner-login.html` | Mağaza sahibi girişi |
| `partner-dashboard.html` | Mağaza paneli (ürün, sipariş, profil, ayarlar) |
| `admin.html` | Platform yönetici paneli |
| `hakkimizda.html`, `kariyer.html`, `yardim.html`, `iade-iptal.html`, `kargo-takip.html` | Bilgi/destek sayfaları |
| `store.html` | Eski/legacy mağaza paneli (artık kullanılmıyor, bkz. `partner-dashboard.html`) |

## Demo hesaplar

- **Müşteri:** `demo@markabahcem.com` / `123456`
- **Mağaza (Beymen):** `beymen@markabahcem.com` / `123456`
- **Mağaza (Koton):** `koton@markabahcem.com` / `123456`
- **Admin:** `admin@markabahcem.com` / `admin123`

## Yerelde çalıştırma

Bu proje saf HTML/CSS/JS olduğu için herhangi bir statik dosya sunucusuyla
çalışır. En basit yol, `index.html`'i doğrudan tarayıcıda açmaktır (bazı
tarayıcılarda `file://` kısıtları olabileceğinden basit bir sunucu tercih
edilir):

```bash
npx serve .
# veya
python3 -m http.server 8000
```

Node.js gerektiren bir hosting ortamına (ör. Hostinger "Web Uygulaması")
deploy edecekseniz, depoda bulunan Express sunucusu kullanılabilir:

```bash
npm install
npm start
```

## Hosting notları (Hostinger'da yaşanan dersler)

1. Bazı hosting platformları düz statik HTML kabul etmez, `package.json` +
   çalışan bir Node.js süreci bekler — bu yüzden `server.js` eklendi.
2. `app.listen(PORT)` yeterli değildir; `app.listen(PORT, "0.0.0.0", ...)`
   gerekir, aksi halde proxy uygulamaya ulaşamaz (503 crash-loop).
3. GitHub entegrasyonlarında platformun kendi kopyaladığı repo'yu takip
   ettiğinden emin olun — orijinal repo'yu güncellemek yeterli olmayabilir.
4. Deploy sonrası CDN önbelleği nedeniyle bazı isteklerde eski içerik
   görülebilir; birkaç dakika içinde/purge ile düzelir.

Daha basit ve öngörülebilir bir deploy için Netlify, Vercel veya GitHub
Pages gibi Node.js gerektirmeyen statik hosting seçenekleri de
değerlendirilebilir.

## Bilinen eksikler

- Gerçek, paylaşılan bir backend + veritabanı yok.
- Gerçek ödeme entegrasyonu yok (split payment için sub-merchant destekli
  bir sağlayıcı — iyzico/PayTR Pazaryeri — gerekir).
- Gerçek kullanıcı kimlik doğrulama yok (tamamen demo amaçlı).
- Gerçek dosya/görsel depolama yok (base64 + localStorage, ölçeklenmez).
- ETBİS kaydı ve ilgili hukuki/mali danışmanlık gerekir (bu doküman hukuki
  tavsiye değildir).

## Lisans / Not

Bu proje bir iş fikri prototipidir; ürün adları (Beymen, Vakko, Koton vb.)
yalnızca örnek/gösterim amacıyla kullanılmıştır ve bu markalarla resmi bir
bağlantısı yoktur.
