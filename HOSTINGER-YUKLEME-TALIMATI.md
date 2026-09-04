# markabahçem.com — Hostinger'a Yükleme Talimatı

Bu proje artık **iki farklı şekilde** yayınlanabilir. Ekran görüntüsünde gördüğün
"Web Uygulamasını Dağıtın" seçeneğini kullanacaksan **1. Yöntem**'i takip et.

---

## 1. YÖNTEM — "Web Uygulamasını Dağıtın" (Node.js Web Apps Hosting) — ÖNERİLEN

Hostinger'ın bu yeni özelliği bir `package.json` ve çalışan bir Node.js sunucusu
bekler; düz HTML dosyalarını doğrudan kabul etmez. Bu yüzden projeye küçük bir
`server.js` (Express) eklendi — bu sunucu sadece mevcut HTML/CSS/JS dosyalarını
olduğu gibi tarayıcıya sunuyor, sitenin görünümünde/kodunda HİÇBİR ŞEY değişmedi.

### Adımlar
1. hPanel → **Web Siteleri** → **Site ekle** → **Web Uygulamasını Dağıtın**
2. "Dosyaları yükleyin" seçeneğini seç (GitHub bağlamana gerek yok)
3. Bu klasördeki **tüm dosyaları** (README hariç, `node_modules` YOK çünkü zaten silindi)
   içeren zip dosyasını yükle
4. Hostinger `package.json`'ı otomatik algılayacak. Sorarsa:
   - **Install command:** `npm install`
   - **Build command:** boş bırak / yok (build adımı gerekmiyor)
   - **Start command:** `npm start` (veya `node server.js`)
   - **Node sürümü:** 18, 20, 22 veya 24 — hepsi çalışır
5. **Deploy** butonuna bas, birkaç dakika içinde site canlıya çıkar
6. Domainini (markabahcem.com) bu Web App'e bağla (hPanel'de "Domain bağla" adımı)

### Bunu nasıl doğrularsın?
Site açıldığında sekme başlığında **"Karmaşa Yok, Sadece Bildiğin Markalar"**
yazdığını görmelisin. Görmüyorsan eski dosyalar hâlâ ayaktadır, yeniden deploy et.

---

## 2. YÖNTEM — "Özel PHP/HTML Web Sitesi" (klasik dosya yöneticisi/FTP)

Node.js kullanmak istemezsen, `server.js` ve `package.json` dosyalarını
YOKSAYIP geri kalan tüm dosyaları (index.html, *.css, *.js, .htaccess vb.)
düz bir statik site olarak da yükleyebilirsin:

1. hPanel → Web Siteleri → ilgili site → **Dosya Yöneticisi**
2. `public_html` klasörünün İÇİNE gir (klasörün kendisine değil)
3. `server.js` ve `package.json` HARİÇ tüm dosyaları oraya yükle
4. Sitenin adresine gidip `index.html`'in açıldığını doğrula

---

## Bu Sürüm Ne İşe Yarar, Ne İşe Yaramaz

✅ **Yapabildikleri:**
- Vitrin, ürün detay, sepet, checkout akışının tamamı gerçek gibi çalışır
- Split payment simülasyonu (tek ödeme → mağazalara otomatik bölünme) tarayıcıda gerçekleşir
- Partner paneli (işletme girişi, ürün ekleme, sipariş görme) çalışır
- Admin paneli (işletme onaylama/reddetme, mali özet) çalışır
- Mobil uyumlu (telefon/tablet ekranlarına göre düzenlendi)

❌ **Yapamadıkları:**
- Veriler sadece SENİN tarayıcında (localStorage) saklanır. Başka biri siteyi
  açtığında SIFIRDAN başlangıç verisini görür — senin eklediğin ürün/sipariş
  onda görünmez. Bu bir "çok kullanıcılı gerçek sistem" değil, kişisel demo.
- Sayfayı temizleyip (tarayıcı verilerini silip) tekrar açarsan demo verisi sıfırlanır.
- Gerçek ödeme, gerçek kargo, gerçek e-posta gönderimi YOKTUR.

## Demoyu Sıfırlamak İstersen
Tarayıcı konsolunu aç (F12) ve şunu yaz:
```js
resetMarkabahcemDemo()
```

## Gerçek Bir Ürüne Dönüştürmek İçin
Bu sürüm sadece "görünür, gezinilebilir demo" amaçlıdır. Gerçek, çok kullanıcılı
bir platforma dönüştürmek için:
1. `server.js`'e gerçek bir veritabanı (PostgreSQL/MySQL) bağlanmalı — şu an veri
   tarayıcıda localStorage'da duruyor, buna dokunulmadı
2. Gerçek iyzico Marketplace / PayTR Pazaryeri ödeme entegrasyonu yapılmalı
   (mağazalara direkt ödeme bölünmesi için)
3. Mağazalarla gerçek API/ticari anlaşma sağlanmalı
