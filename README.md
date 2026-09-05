# markabahçem 🌿

> "markabahçem — karmaşa yok, sadece bildiğin markalar."

Trendyol gibi platformlarda herkesin dükkân açabilmesi karmaşa ve güven
sorunu yaratıyor. **markabahçem**, sadece gerçek, bilinen, köklü markaların
yer aldığı, kürasyonlu, çok-markalı bir alışveriş platformu fikridir
(Farfetch benzeri bir model: markalar kendi ürününü listeler, kendi
kargosunu gönderir, platform sadece komisyon alır).

## ✅ Artık gerçek bir backend'i var

Bu proje **Express + MongoDB (Mongoose)** ile çalışan gerçek bir backend'e
sahiptir. Admin panelinden yapılan her değişiklik (yeni ürün, banner,
onaylanan başvuru, logo, hikaye vb.) **herkeste ve her cihazda** anında
görünür — artık tarayıcıya özel localStorage sınırlaması yoktur.

Görseller (ürün fotoğrafı, logo, banner) basitlik için doğrudan veritabanında
sıkıştırılmış base64 metin olarak saklanır; ayrı bir görsel depolama
servisine (S3, Cloudinary vb.) ihtiyaç yoktur.

Eski mimari (localStorage + `js/static-api.js` fetch-override) artık
**kullanılmıyor** ama geçmiş referansı için repoda bırakıldı.

## Kurulum

### 1) MongoDB Atlas (ücretsiz)

1. [mongodb.com/cloud/atlas/register](https://mongodb.com/cloud/atlas/register) üzerinden ücretsiz kayıt olun.
2. Ücretsiz **M0** cluster oluşturun.
3. Bir veritabanı kullanıcısı (kullanıcı adı/şifre) oluşturun.
4. **Network Access** → "Allow Access from Anywhere" (0.0.0.0/0) ekleyin.
5. **Connect → Drivers** üzerinden bağlantı adresini (connection string) kopyalayın.

### 2) Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayıp doldurun (yerelde test
ederken) **ya da** Hostinger panelinde **"Ortam değişkenleri"** bölümüne
aynı değerleri girin:

```
MONGODB_URI=mongodb+srv://kullanici:sifre@cluster0.xxxxx.mongodb.net/markabahcem?retryWrites=true&w=majority
ADMIN_EMAIL=admin@markabahcem.com
ADMIN_PASSWORD=admin123
SEED_KEY=kendi-belirleyeceğiniz-gizli-bir-anahtar
PORT=3000
```

`.env` dosyası `.gitignore` içinde olduğu için GitHub'a asla yüklenmez —
sırlarınız güvende kalır.

### 3) Veritabanını başlangıç verisiyle doldurma (seed)

**Terminal/SSH erişiminiz varsa:**
```bash
npm install
npm run seed
```

**SSH erişiminiz yoksa** (çoğu paylaşımlı hosting planında bu geçerlidir),
deploy tamamlandıktan sonra tarayıcıdan şu adresi ziyaret edin:

```
https://markabahcem.com/kurulum/seed?key=SEED_KEY_degeriniz
```

Bu adres veritabanı boşsa 14 marka, ürünleri, banner'ları ve site
ayarlarını otomatik oluşturur. Veritabanı zaten doluysa hiçbir şeye
dokunmadan bunu bildirir — güvenle birden fazla kez ziyaret edebilirsiniz.

### 4) Yerelde çalıştırma

```bash
npm install
npm run seed
npm start
```

Sonra `http://localhost:3000` adresini açın.

## Demo hesaplar

- **Müşteri:** kayıt ol ekranından yeni bir hesap oluşturun (artık gerçek kayıt).
- **Mağaza:** her markanın girişi `{marka-slug}@markabahcem.com` / `123456`
  (örn. `beymen@markabahcem.com`, `zara@markabahcem.com`) — tam listeyi
  seed çıktısında veya `/kurulum/seed` sayfasının sonucunda görebilirsiniz.
- **Admin:** `.env`'de belirlediğiniz `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  (varsayılan: `admin@markabahcem.com` / `admin123`).

## Sayfalar

| Dosya | Açıklama |
|---|---|
| `index.html` | Ana sayfa |
| `category.html` | Kategoriye göre ürün listeleme + filtreler |
| `product.html` | Ürün detay sayfası |
| `search.html` | Arama sonuçları |
| `favorites.html` | Favoriler |
| `checkout.html` | Sepet → adres → ödeme → onay (ödeme yine simüle edilir) |
| `login.html` | Müşteri girişi/kaydı (artık gerçek) |
| `store-profile.html` | Mağaza vitrin sayfası |
| `partner-apply.html` | Marka/mağaza başvuru formu |
| `partner-login.html` | Mağaza sahibi girişi |
| `partner-dashboard.html` | Mağaza paneli (ürün, sipariş, profil, ayarlar) |
| `admin.html` | Platform yönetici paneli (tüm mağazaları buradan da yönetebilirsiniz) |
| `hakkimizda.html`, `kariyer.html`, `yardim.html`, `iade-iptal.html`, `kargo-takip.html` | Bilgi/destek sayfaları |
| `store.html` | Eski/legacy mağaza paneli (artık kullanılmıyor) |

## Backend dosya yapısı

| Dosya/Klasör | Açıklama |
|---|---|
| `server.js` | Express sunucusu, statik dosyalar + API + `/kurulum/seed` |
| `config/db.js` | MongoDB bağlantısı |
| `models/` | Mongoose şemaları (Store, Product, Order, Application, User, SiteSettings) |
| `routes/api.js` | Tüm `/api/...` uç noktaları |
| `utils/seedData.js` | Başlangıç verisi mantığı (CLI ve `/kurulum/seed` ortak kullanır) |
| `seed.js` | Terminalden `npm run seed` ile çalıştırılan script |
| `js/static-api.js` | **[Artık kullanılmıyor]** eski localStorage tabanlı sahte backend |

## Bilinen sınırlamalar

- Gerçek ödeme entegrasyonu yok (split payment için sub-merchant destekli
  bir sağlayıcı — iyzico/PayTR Pazaryeri — gerekir).
- Oturum yönetimi basittir (JWT/güvenli session yok) — bu bir prototip,
  üretime almadan önce güvenlik sertleştirmesi (rate limiting, JWT,
  HTTPS-only cookie vb.) yapılmalıdır.
- Görseller veritabanında base64 olarak saklanıyor; çok büyük ürün
  kataloglarında bu verimsizleşebilir, o noktada Cloudinary/S3 gibi bir
  servise geçilmesi önerilir.
- ETBİS kaydı ve ilgili hukuki/mali danışmanlık gerekir (bu doküman hukuki
  tavsiye değildir).

## Lisans / Not

Bu proje bir iş fikri prototipidir; ürün adları (Beymen, Vakko, Koton vb.)
yalnızca örnek/gösterim amacıyla kullanılmıştır ve bu markalarla resmi bir
bağlantısı yoktur.
