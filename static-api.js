// ============================================================
// STATIC-API.JS
// Bu dosya, markabahçem'in tüm backend mantığını (Node/Express'te
// server.js + checkoutService.js + data/db.js olarak yazdığımız her şeyi)
// tarayıcı içine taşır. Gerçek bir sunucu YOKTUR — window.fetch()
// override edilerek /api/... isteklerine localStorage üzerinden cevap verilir.
//
// AMAÇ: Bu site herhangi bir statik hosting alanına (Hostinger PHP/HTML,
// Netlify, GitHub Pages, vs.) yüklenebilsin — Node.js süreci gerekmez.
//
// NOT: Veriler sadece o tarayıcıda saklanır (localStorage). Başka bir
// cihazdan/tarayıcıdan bakan biri sıfırdan başlangıç verisini görür.
// Yatırımcı demosu için yeterlidir; gerçek çok kullanıcılı bir sistem
// için gerçek bir backend (Node/PHP + veritabanı) gerekir.
// ============================================================

(function () {
  const DB_KEY = "markabahcem_static_db";

  // ---------- BAŞLANGIÇ (SEED) VERİSİ ----------
  const SEED = {
    siteSettings: {
      logoImage: null,
      logoText: "markabahçem",
    },
    stores: [
      { id: "store-beymen", name: "Beymen", slug: "beymen", commissionRate: 12, subMerchantKey: "SIM-SUBMERCHANT-BEYMEN-001", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#1a1a2e,#533483)", description: "Beymen, 1971'den bu yana Türkiye'nin öncü lüks moda perakendecisi. Klasik ve şık parçalarla şıklığınızı tamamlayın.", contactEmail: "magaza@beymen.com", contactName: "Beymen Operasyon", appliedAt: "2026-06-01T10:00:00.000Z" },
      { id: "store-koton", name: "Koton", slug: "koton", commissionRate: 15, subMerchantKey: "SIM-SUBMERCHANT-KOTON-002", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#c31432,#ffaf7b)", description: "Koton, genç ve dinamik ruhu yansıtan, uygun fiyatlı ve trend giyim ürünleri sunan bir moda markasıdır.", contactEmail: "magaza@koton.com", contactName: "Koton Operasyon", appliedAt: "2026-06-01T10:00:00.000Z" },
      { id: "store-adilisik", name: "Adil Işık", slug: "adilisik", commissionRate: 10, subMerchantKey: "SIM-SUBMERCHANT-ADILISIK-003", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#3e2f1c,#8e7355)", description: "Adil Işık, klasik erkek giyiminde kalite ve zarafeti bir araya getiren köklü bir Türk markasıdır.", contactEmail: "magaza@adilisik.com", contactName: "Adil Işık Operasyon", appliedAt: "2026-06-01T10:00:00.000Z" },
      { id: "store-altinyildiz", name: "Altınyıldız Classics", slug: "altinyildiz", commissionRate: 13, subMerchantKey: "SIM-SUBMERCHANT-ALTINYILDIZ-004", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#2c3e50,#4ca1af)", description: "Altınyıldız Classics, modern erkeğin klasik ve şık ihtiyaçlarını karşılayan güvenilir bir markadır.", contactEmail: "magaza@altinyildiz.com", contactName: "Altınyıldız Operasyon", appliedAt: "2026-06-01T10:00:00.000Z" },
      { id: "store-lcwaikiki", name: "LC Waikiki", slug: "lcwaikiki", commissionRate: 14, subMerchantKey: null, status: "pending", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#0f2027,#2c5364)", description: "LC Waikiki, aile giyiminde uygun fiyat ve geniş ürün yelpazesiyle Türkiye'nin en sevilen markalarından.", contactEmail: "magaza@lcwaikiki.com", contactName: "LC Waikiki Operasyon", appliedAt: "2026-09-01T09:30:00.000Z" },
      { id: "store-arcelik", name: "Arçelik", slug: "arcelik", commissionRate: 11, subMerchantKey: "SIM-SUBMERCHANT-ARCELIK-006", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#134e5e,#71b280)", description: "Arçelik, 70 yılı aşkın süredir evlere teknoloji ve kaliteyi taşıyan Türkiye'nin lider beyaz eşya markası.", contactEmail: "magaza@arcelik.com", contactName: "Arçelik Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-mediamarkt", name: "Media Markt", slug: "mediamarkt", commissionRate: 9, subMerchantKey: "SIM-SUBMERCHANT-MEDIAMARKT-007", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#e53935,#e35d5b)", description: "Media Markt, elektronik ve teknoloji ürünlerinde geniş ürün yelpazesi ve uzman kadrosuyla hizmet verir.", contactEmail: "magaza@mediamarkt.com.tr", contactName: "Media Markt Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-zara", name: "Zara", slug: "zara", commissionRate: 16, subMerchantKey: "SIM-SUBMERCHANT-ZARA-008", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#232526,#414345)", description: "Zara, güncel moda trendlerini hızlı ve erişilebilir şekilde sunan global bir moda markasıdır.", contactEmail: "magaza@zara.com", contactName: "Zara Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-hm", name: "H&M", slug: "hm", commissionRate: 15, subMerchantKey: "SIM-SUBMERCHANT-HM-009", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#cb2d3e,#ef473a)", description: "H&M, sürdürülebilir ve uygun fiyatlı modayı herkes için erişilebilir kılan İsveç kökenli global markadır.", contactEmail: "magaza@hm.com", contactName: "H&M Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-atasay", name: "Atasay", slug: "atasay", commissionRate: 8, subMerchantKey: "SIM-SUBMERCHANT-ATASAY-010", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#bdc3c7,#2c3e50)", description: "Atasay, 1937'den bu yana Türkiye'nin en büyük mücevher üreticisi ve güvenilir altın/mücevher markası.", contactEmail: "magaza@atasay.com", contactName: "Atasay Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-atasunoptik", name: "Atasun Optik", slug: "atasunoptik", commissionRate: 13, subMerchantKey: "SIM-SUBMERCHANT-ATASUNOPTIK-011", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#000428,#004e92)", description: "Atasun Optik, Türkiye genelinde göz sağlığı ve moda gözlük alanında hizmet veren lider optik zinciridir.", contactEmail: "magaza@atasunoptik.com", contactName: "Atasun Optik Operasyon", appliedAt: "2026-07-15T10:00:00.000Z" },
      { id: "store-starbucks", name: "Starbucks", slug: "starbucks", commissionRate: 12, subMerchantKey: "SIM-SUBMERCHANT-STARBUCKS-012", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#0e3b2e,#1a5c47)", description: "Starbucks, dünyanın en büyük kahve zinciri; şimdi markabahçem'de kendi kahve ve ekipman ürünleriyle.", contactEmail: "magaza@starbucks.com.tr", contactName: "Starbucks Operasyon", appliedAt: "2026-07-20T10:00:00.000Z" },
      { id: "store-kahvedunyasi", name: "Kahve Dünyası", slug: "kahvedunyasi", commissionRate: 10, subMerchantKey: "SIM-SUBMERCHANT-KAHVEDUNYASI-013", status: "active", logoImage: null, bannerImage: null, bannerGradient: "linear-gradient(120deg,#4d2a15,#8a5a34)", description: "Kahve Dünyası, geleneksel Türk kahvesi kültürünü modern sunumla buluşturan yerli bir markadır.", contactEmail: "magaza@kahvedunyasi.com", contactName: "Kahve Dünyası Operasyon", appliedAt: "2026-07-20T10:00:00.000Z" },
    ],
    products: [
      { id: "p-1", storeId: "store-beymen", name: "Beymen Slim Fit Tişört", price: 890, stock: 24, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcwIDQwIEw2MCA1NSBMNDUgNjUgTDYwIDg1IEw3MCA3NSBMNzAgMTY1IEwxMzAgMTY1IEwxMzAgNzUgTDE0MCA4NSBMMTU1IDY1IEwxNDAgNTUgTDEzMCA0MAogICAgICAgICBRMTIwIDU1IDEwMCA1NSBRODAgNTUgNzAgNDAgWiIgZmlsbD0iIzJjMmMyYyIvPgo8cGF0aCBkPSJNODUgNDUgUTEwMCA2MCAxMTUgNDUiIHN0cm9rZT0iIzQ0NCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==", category: "erkek", subcategory: "Tişört" },
      { id: "p-2", storeId: "store-beymen", name: "Beymen Deri Kemer", price: 1450, stock: 12, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHJlY3QgeD0iMjAiIHk9IjkwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzVhMzgyNSIvPgo8cmVjdCB4PSIyMCIgeT0iOTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMjAiIHJ4PSI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzZDI1MTciIHN0cm9rZS13aWR0aD0iMS41Ii8+CjxyZWN0IHg9IjgyIiB5PSI4NSIgd2lkdGg9IjM2IiBoZWlnaHQ9IjMwIiByeD0iNiIgZmlsbD0iI2Q0YWYzNyIvPgo8cmVjdCB4PSI5MCIgeT0iOTMiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNCIgcng9IjMiIGZpbGw9IiM1YTM4MjUiLz4KPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTAwIiByPSIyLjUiIGZpbGw9IiMzZDI1MTciLz4KPGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIyLjUiIGZpbGw9IiMzZDI1MTciLz4KPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTAwIiByPSIyLjUiIGZpbGw9IiMzZDI1MTciLz4KPC9zdmc+", category: "erkek", subcategory: "Kemer" },
      { id: "p-3", storeId: "store-koton", name: "Koton Yüksek Bel Kot Pantolon", price: 649, stock: 40, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTc1IDMwIEwxMjUgMzAgTDEyOCA5MCBMMTUwIDE3MCBMMTI1IDE3MCBMMTA1IDEwMCBMOTUgMTAwIEw3NSAxNzAgTDUwIDE3MCBMNzIgOTAgWiIgZmlsbD0iIzRhNmI4YSIvPgo8cmVjdCB4PSI3NSIgeT0iMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxNCIgZmlsbD0iIzNkNWE3NSIvPgo8bGluZSB4MT0iMTAwIiB5MT0iNDQiIHgyPSIxMDAiIHkyPSI5MCIgc3Ryb2tlPSIjMmY0YTYzIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIzNyIgcj0iMyIgZmlsbD0iIzJmNGE2MyIvPgo8L3N2Zz4=", category: "kadin", subcategory: "Kot Pantolon" },
      { id: "p-4", storeId: "store-koton", name: "Koton Oversize Sweatshirt", price: 549, stock: 30, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTY1IDQ1IEw1MCA1NSBMMzUgNzUgTDUyIDk1IEw2NSA4MiBMNjUgMTYwIEwxMzUgMTYwIEwxMzUgODIgTDE0OCA5NSBMMTY1IDc1IEwxNTAgNTUgTDEzNSA0NQogICAgICAgICBRMTI1IDYyIDEwMCA2MiBRNzUgNjIgNjUgNDUgWiIgZmlsbD0iIzliOWI5YiIvPgo8cmVjdCB4PSI2NSIgeT0iMTUwIiB3aWR0aD0iNzAiIGhlaWdodD0iMTAiIGZpbGw9IiM3YTdhN2EiLz4KPHJlY3QgeD0iMzUiIHk9Ijc1IiB3aWR0aD0iMTciIGhlaWdodD0iMTAiIGZpbGw9IiM3YTdhN2EiLz4KPHJlY3QgeD0iMTQ4IiB5PSI3NSIgd2lkdGg9IjE3IiBoZWlnaHQ9IjEwIiBmaWxsPSIjN2E3YTdhIi8+Cjwvc3ZnPg==", category: "kadin", subcategory: "Sweatshirt" },
      { id: "p-5", storeId: "store-adilisik", name: "Adil Işık Klasik Gömlek", price: 1290, stock: 18, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcwIDQwIEw1OCA1MCBMNDIgNjggTDU4IDg1IEw3MCA3NSBMNzAgMTY1IEwxMzAgMTY1IEwxMzAgNzUgTDE0MiA4NSBMMTU4IDY4IEwxNDIgNTAgTDEzMCA0MAogICAgICAgICBMMTEyIDU1IEwxMDAgNjUgTDg4IDU1IFoiIGZpbGw9IiNlOGVlZjIiLz4KPHBhdGggZD0iTTcwIDQwIEw4OCA1NSBMMTAwIDY1IEwxMTIgNTUgTDEzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzNjY2Q0IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8bGluZSB4MT0iMTAwIiB5MT0iNjUiIHgyPSIxMDAiIHkyPSIxNjUiIHN0cm9rZT0iI2MzY2NkNCIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijg1IiByPSIxLjgiIGZpbGw9IiNhYWI0YmQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTA1IiByPSIxLjgiIGZpbGw9IiNhYWI0YmQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTI1IiByPSIxLjgiIGZpbGw9IiNhYWI0YmQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTQ1IiByPSIxLjgiIGZpbGw9IiNhYWI0YmQiLz4KPC9zdmc+", category: "erkek", subcategory: "Gömlek" },
      { id: "p-6", storeId: "store-adilisik", name: "Adil Işık Takım Elbise", price: 6900, stock: 8, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcyIDM4IEw1NSA1MCBMNDAgNzAgTDU2IDg4IEw3MiA3NiBMNzIgMTY4IEwxMjggMTY4IEwxMjggNzYgTDE0NCA4OCBMMTYwIDcwIEwxNDUgNTAgTDEyOCAzOAogICAgICAgICBMMTA4IDU4IEwxMDAgNzAgTDkyIDU4IFoiIGZpbGw9IiMxZjI3MzMiLz4KPHBhdGggZD0iTTEwMCA3MCBMODggNjAgTDgyIDE2OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZThlOGU4IiBzdHJva2Utd2lkdGg9IjUiLz4KPHBhdGggZD0iTTEwMCA3MCBMMTEyIDYwIEwxMTggMTY4IiBmaWxsPSJub25lIiBzdHJva2U9IiNlOGU4ZTgiIHN0cm9rZS13aWR0aD0iNSIvPgo8Y2lyY2xlIGN4PSI5NyIgY3k9IjExMCIgcj0iMiIgZmlsbD0iI2M5YTI0YiIvPgo8Y2lyY2xlIGN4PSI5NyIgY3k9IjEyOCIgcj0iMiIgZmlsbD0iI2M5YTI0YiIvPgo8L3N2Zz4=", category: "erkek", subcategory: "Takım Elbise" },
      { id: "p-7", storeId: "store-altinyildiz", name: "Altınyıldız Slim Gömlek", price: 799, stock: 25, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcwIDQwIEw1OCA1MCBMNDIgNjggTDU4IDg1IEw3MCA3NSBMNzAgMTY1IEwxMzAgMTY1IEwxMzAgNzUgTDE0MiA4NSBMMTU4IDY4IEwxNDIgNTAgTDEzMCA0MAogICAgICAgICBMMTEyIDU1IEwxMDAgNjUgTDg4IDU1IFoiIGZpbGw9IiNkYmU2ZjAiLz4KPHBhdGggZD0iTTcwIDQwIEw4OCA1NSBMMTAwIDY1IEwxMTIgNTUgTDEzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTljMGQ2IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8bGluZSB4MT0iMTAwIiB5MT0iNjUiIHgyPSIxMDAiIHkyPSIxNjUiIHN0cm9rZT0iI2E5YzBkNiIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijg1IiByPSIxLjgiIGZpbGw9IiM3ZDliYjUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTA1IiByPSIxLjgiIGZpbGw9IiM3ZDliYjUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTI1IiByPSIxLjgiIGZpbGw9IiM3ZDliYjUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTQ1IiByPSIxLjgiIGZpbGw9IiM3ZDliYjUiLz4KPC9zdmc+", category: "erkek", subcategory: "Gömlek" },
      { id: "p-8", storeId: "store-altinyildiz", name: "Altınyıldız Yün Kaban", price: 3450, stock: 10, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTY4IDM1IEw0OCA1MCBMMzAgNzUgTDQ4IDk1IEw2OCA4MCBMNjggMTcyIEwxMzIgMTcyIEwxMzIgODAgTDE1MiA5NSBMMTcwIDc1IEwxNTIgNTAgTDEzMiAzNQogICAgICAgICBMMTEwIDU1IEwxMDAgNjggTDkwIDU1IFoiIGZpbGw9IiNiMDhkNWIiLz4KPHBhdGggZD0iTTEwMCA2OCBMODggNTggTDgwIDE3MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGY2ZjQyIiBzdHJva2Utd2lkdGg9IjQiLz4KPHBhdGggZD0iTTEwMCA2OCBMMTEyIDU4IEwxMjAgMTcyIiBmaWxsPSJub25lIiBzdHJva2U9IiM4ZjZmNDIiIHN0cm9rZS13aWR0aD0iNCIvPgo8Y2lyY2xlIGN4PSI5NCIgY3k9IjExNSIgcj0iMi4yIiBmaWxsPSIjNWM0NTI3Ii8+CjxjaXJjbGUgY3g9Ijk0IiBjeT0iMTM1IiByPSIyLjIiIGZpbGw9IiM1YzQ1MjciLz4KPGNpcmNsZSBjeD0iOTQiIGN5PSIxNTUiIHI9IjIuMiIgZmlsbD0iIzVjNDUyNyIvPgo8L3N2Zz4=", category: "kadin", subcategory: "Mont" },
      { id: "p-9", storeId: "store-beymen", name: "Beymen Klasik Deri Ayakkabı", price: 2650, stock: 14, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTMwIDE0MCBRMzAgMTIwIDU1IDExNSBMMTAwIDEwMCBRMTIwIDk1IDEzNSAxMDUgTDE2NSAxMjAgUTE3NSAxMjUgMTc1IDE0MCBMMTc1IDE1MCBMMzAgMTUwIFoiIGZpbGw9IiMyYzFkMTIiLz4KPHBhdGggZD0iTTU1IDExNSBRNzUgMTA4IDkwIDExMiBMMTAwIDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNGEzMzIwIiBzdHJva2Utd2lkdGg9IjIiLz4KPGVsbGlwc2UgY3g9IjE2NSIgY3k9IjE0NSIgcng9IjEyIiByeT0iNiIgZmlsbD0iIzRhMzMyMCIvPgo8cmVjdCB4PSIzMCIgeT0iMTQ4IiB3aWR0aD0iMTQ1IiBoZWlnaHQ9IjgiIHJ4PSIzIiBmaWxsPSIjMWExMjBhIi8+Cjwvc3ZnPg==", category: "erkek", subcategory: "Klasik Ayakkabı" },
      { id: "p-10", storeId: "store-koton", name: "Koton Çiçek Desenli Elbise", price: 899, stock: 22, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTc1IDM1IEw2MCA0OCBMNDggNjUgTDYyIDgwIEw3NSA3MCBMNjUgMTc1IEwxMzUgMTc1IEwxMjUgNzAgTDEzOCA4MCBMMTUyIDY1IEwxNDAgNDggTDEyNSAzNQogICAgICAgICBRMTE1IDUwIDEwMCA1MCBRODUgNTAgNzUgMzUgWiIgZmlsbD0iI2Q4OGJhMCIvPgo8Y2lyY2xlIGN4PSI4NSIgY3k9IjkwIiByPSI0IiBmaWxsPSIjZjRjMmQxIi8+CjxjaXJjbGUgY3g9IjEwNSIgY3k9IjEwNSIgcj0iNCIgZmlsbD0iI2Y0YzJkMSIvPgo8Y2lyY2xlIGN4PSI5MCIgY3k9IjEzMCIgcj0iNCIgZmlsbD0iI2Y0YzJkMSIvPgo8Y2lyY2xlIGN4PSIxMTUiIGN5PSI4MCIgcj0iNCIgZmlsbD0iI2Y0YzJkMSIvPgo8Y2lyY2xlIGN4PSIxMjAiIGN5PSIxNDAiIHI9IjQiIGZpbGw9IiNmNGMyZDEiLz4KPC9zdmc+", category: "kadin", subcategory: "Elbise" },
      { id: "p-11", storeId: "store-koton", name: "Koton Basic Gömlek", price: 459, stock: 35, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcwIDQwIEw1OCA1MCBMNDIgNjggTDU4IDg1IEw3MCA3NSBMNzAgMTY1IEwxMzAgMTY1IEwxMzAgNzUgTDE0MiA4NSBMMTU4IDY4IEwxNDIgNTAgTDEzMCA0MAogICAgICAgICBMMTEyIDU1IEwxMDAgNjUgTDg4IDU1IFoiIGZpbGw9IiNmMmU0YzkiLz4KPHBhdGggZD0iTTcwIDQwIEw4OCA1NSBMMTAwIDY1IEwxMTIgNTUgTDEzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDhjMjk5IiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8bGluZSB4MT0iMTAwIiB5MT0iNjUiIHgyPSIxMDAiIHkyPSIxNjUiIHN0cm9rZT0iI2Q4YzI5OSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==", category: "kadin", subcategory: "Gömlek & Bluz" },
      { id: "p-12", storeId: "store-adilisik", name: "Adil Işık İpek Kravat", price: 590, stock: 20, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTkwIDMwIEwxMTAgMzAgTDExNSA1NSBMMTAwIDY1IEw4NSA1NSBaIiBmaWxsPSIjN2ExZjJiIi8+CjxwYXRoIGQ9Ik05MiA2NSBMMTA4IDY1IEwxMjAgMTUwIEwxMDAgMTc1IEw4MCAxNTAgWiIgZmlsbD0iIzhmMjczMyIvPgo8cGF0aCBkPSJNOTIgNjUgTDEwOCA2NSBMMTA0IDkwIEw5NiA5MCBaIiBmaWxsPSIjNmIxYTI0Ii8+Cjwvc3ZnPg==", category: "erkek", subcategory: "Kravat & Poşet Mendil" },
      { id: "p-13", storeId: "store-altinyildiz", name: "Altınyıldız Klasik Pantolon", price: 1190, stock: 16, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTc4IDMwIEwxMjIgMzAgTDEyNSA5MCBMMTQ1IDE3MCBMMTIwIDE3MCBMMTA0IDEwMCBMOTYgMTAwIEw4MCAxNzAgTDU1IDE3MCBMNzUgOTAgWiIgZmlsbD0iIzNhM2Q0MiIvPgo8cmVjdCB4PSI3OCIgeT0iMzAiIHdpZHRoPSI0NCIgaGVpZ2h0PSIxMiIgZmlsbD0iIzJiMmQzMSIvPgo8bGluZSB4MT0iMTAwIiB5MT0iNDIiIHgyPSIxMDAiIHkyPSI5MCIgc3Ryb2tlPSIjMjUyNzJiIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4=", category: "erkek", subcategory: "Pantolon" },
      { id: "p-14", storeId: "store-beymen", name: "Beymen Club Beyaz Comfort Fit Yakası Çizgili Pike Polo T-shirt", price: 1300, stock: 15, image: "👕", category: "erkek", subcategory: "Tişört" },
      { id: "p-15", storeId: "store-beymen", name: "Beymen Club Siyah Slim Fit Siyah Oxford Gömlek", price: 1350, stock: 12, image: "👔", category: "erkek", subcategory: "Gömlek" },
      { id: "p-16", storeId: "store-arcelik", name: "Arçelik Robot Süpürge", price: 8990, stock: 20, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEyMCIgcng9IjU1IiByeT0iNTAiIGZpbGw9IiNlOGU4ZTgiLz4KPGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEyMCIgcng9IjU1IiByeT0iNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2M1YzVjNSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEyMCIgcj0iMzAiIGZpbGw9IiMyYzJjMmMiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTIwIiByPSIxMCIgZmlsbD0iIzRhNGE0YSIvPgo8Y2lyY2xlIGN4PSI3MCIgY3k9Ijk1IiByPSI0IiBmaWxsPSIjM2Q3YWI4Ii8+CjxyZWN0IHg9IjYwIiB5PSIxNjUiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iI2M1YzVjNSIvPgo8L3N2Zz4=", category: "elektronik", subcategory: "Süpürge" },
      { id: "p-17", storeId: "store-arcelik", name: "Arçelik Kahve Makinesi", price: 3490, stock: 25, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHJlY3QgeD0iNjUiIHk9IjQwIiB3aWR0aD0iNzAiIGhlaWdodD0iOTAiIHJ4PSI2IiBmaWxsPSIjMmMyYzJjIi8+CjxyZWN0IHg9Ijc1IiB5PSI1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjI1IiByeD0iMyIgZmlsbD0iIzRhNGE0YSIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI5NSIgcj0iNSIgZmlsbD0iI2Q0YWYzNyIvPgo8cmVjdCB4PSI4MCIgeT0iMTMwIiB3aWR0aD0iNDAiIGhlaWdodD0iMzUiIGZpbGw9IiNlOGU4ZTgiLz4KPHJlY3QgeD0iODgiIHk9IjE0MCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjIwIiBmaWxsPSIjYmNkNGVhIi8+Cjwvc3ZnPg==", category: "elektronik", subcategory: "Kahve Makinesi" },
      { id: "p-18", storeId: "store-mediamarkt", name: "Akıllı Telefon 128GB", price: 24999, stock: 18, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHJlY3QgeD0iNzIiIHk9IjMwIiB3aWR0aD0iNTYiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiMxYTFhMWEiLz4KPHJlY3QgeD0iNzgiIHk9IjQyIiB3aWR0aD0iNDQiIGhlaWdodD0iMTA1IiByeD0iMiIgZmlsbD0iIzNkN2FiOCIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNjAiIHI9IjUiIGZpbGw9IiMzZDNkM2QiLz4KPC9zdmc+", category: "elektronik", subcategory: "Cep Telefonu" },
      { id: "p-19", storeId: "store-mediamarkt", name: "Kablosuz Kulaklık", price: 2199, stock: 40, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHJlY3QgeD0iNTUiIHk9IjYwIiB3aWR0aD0iOTAiIGhlaWdodD0iNjAiIHJ4PSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMmMyYzJjIiBzdHJva2Utd2lkdGg9IjgiLz4KPGVsbGlwc2UgY3g9IjU4IiBjeT0iMTE1IiByeD0iMTYiIHJ5PSIyMiIgZmlsbD0iIzJjMmMyYyIvPgo8ZWxsaXBzZSBjeD0iMTQyIiBjeT0iMTE1IiByeD0iMTYiIHJ5PSIyMiIgZmlsbD0iIzJjMmMyYyIvPgo8L3N2Zz4=", category: "elektronik", subcategory: "Kulaklık" },
      { id: "p-20", storeId: "store-zara", name: "Zara Relaxed Fit Blazer Ceket", price: 2590, stock: 20, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcyIDM4IEw1NSA1MCBMNDAgNzAgTDU2IDg4IEw3MiA3NiBMNzIgMTY4IEwxMjggMTY4IEwxMjggNzYgTDE0NCA4OCBMMTYwIDcwIEwxNDUgNTAgTDEyOCAzOAogICAgICAgICBMMTA4IDU4IEwxMDAgNzAgTDkyIDU4IFoiIGZpbGw9IiMzYTNhM2EiLz4KPHBhdGggZD0iTTEwMCA3MCBMODYgNjIgTDgwIDE2OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjJmMmYyIiBzdHJva2Utd2lkdGg9IjQiLz4KPHBhdGggZD0iTTEwMCA3MCBMMTE0IDYyIEwxMjAgMTY4IiBmaWxsPSJub25lIiBzdHJva2U9IiNmMmYyZjIiIHN0cm9rZS13aWR0aD0iNCIvPgo8L3N2Zz4=", category: "kadin", subcategory: "Ceket" },
      { id: "p-21", storeId: "store-zara", name: "Zara Straight Leg Jean", price: 1490, stock: 28, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTc4IDMwIEwxMjIgMzAgTDEyNCA5MCBMMTMyIDE3MCBMMTA4IDE3MCBMMTAwIDEwMCBMMTAwIDEwMCBMOTIgMTcwIEw2OCAxNzAgTDc2IDkwIFoiIGZpbGw9IiMzMzQ3NWIiLz4KPHJlY3QgeD0iNzgiIHk9IjMwIiB3aWR0aD0iNDQiIGhlaWdodD0iMTIiIGZpbGw9IiMyODM5NGEiLz4KPC9zdmc+", category: "kadin", subcategory: "Kot Pantolon" },
      { id: "p-22", storeId: "store-hm", name: "H&M Basic Tişört", price: 349, stock: 60, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTcwIDQwIEw2MCA1NSBMNDUgNjUgTDYwIDg1IEw3MCA3NSBMNzAgMTY1IEwxMzAgMTY1IEwxMzAgNzUgTDE0MCA4NSBMMTU1IDY1IEwxNDAgNTUgTDEzMCA0MAogICAgICAgICBRMTIwIDU1IDEwMCA1NSBRODAgNTUgNzAgNDAgWiIgZmlsbD0iI2U2NDEzYSIvPgo8L3N2Zz4=", category: "kadin", subcategory: "Tişört" },
      { id: "p-23", storeId: "store-hm", name: "H&M Oversize Gömlek", price: 799, stock: 34, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTY1IDQyIEw1MiA1MyBMMzggNzIgTDU0IDg4IEw2NSA3OCBMNjUgMTY1IEwxMzUgMTY1IEwxMzUgNzggTDE0NiA4OCBMMTYyIDcyIEwxNDggNTMgTDEzNSA0MgogICAgICAgICBMMTE1IDU4IEwxMDAgNjggTDg1IDU4IFoiIGZpbGw9IiNmNGVkZTAiLz4KPGxpbmUgeDE9IjEwMCIgeTE9IjY4IiB4Mj0iMTAwIiB5Mj0iMTY1IiBzdHJva2U9IiNkOGNjYjQiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=", category: "kadin", subcategory: "Gömlek & Bluz" },
      { id: "p-24", storeId: "store-atasay", name: "Atasay 14 Ayar Altın Kolye", price: 12500, stock: 10, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTYwIDUwIFExMDAgMTAwIDE0MCA1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjQiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTEwIiByPSIxOCIgZmlsbD0iI2YwY2Y2YSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjMiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTEwIiByPSI2IiBmaWxsPSIjZmZmNmRhIi8+Cjwvc3ZnPg==", category: "saat-aksesuar", subcategory: "Takı & Mücevher" },
      { id: "p-25", storeId: "store-atasunoptik", name: "Atasun Polarize Güneş Gözlüğü", price: 1890, stock: 30, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjMmMyYzJjIi8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiMyYzJjMmMiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSIxMDAiIHI9IjIyIiBmaWxsPSIjNWE3YTk5Ii8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9IjEwMCIgcj0iMjIiIGZpbGw9IiM1YTdhOTkiLz4KPHJlY3QgeD0iOTUiIHk9Ijk2IiB3aWR0aD0iMTAiIGhlaWdodD0iNiIgZmlsbD0iIzJjMmMyYyIvPgo8cGF0aCBkPSJNNDAgOTUgTDIwIDg1IiBzdHJva2U9IiMyYzJjMmMiIHN0cm9rZS13aWR0aD0iNCIvPgo8cGF0aCBkPSJNMTYwIDk1IEwxODAgODUiIHN0cm9rZT0iIzJjMmMyYyIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjwvc3ZnPg==", category: "saat-aksesuar", subcategory: "Güneş Gözlüğü" },
      { id: "p-26", storeId: "store-starbucks", name: "Starbucks Filtre Kahve 250g", price: 349, stock: 45, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTYyIDQ1IEwxMzggNDUgTDE0MiAxNjUgUTE0MiAxNzIgMTM1IDE3MiBMNjUgMTcyIFE1OCAxNzIgNTggMTY1IFoiIGZpbGw9IiMwZTNiMmUiLz4KPHJlY3QgeD0iNzIiIHk9IjQ1IiB3aWR0aD0iNTYiIGhlaWdodD0iMTQiIGZpbGw9IiMwYTJjMjIiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIyNCIgZmlsbD0iI2Y1ZjVmNSIvPgo8cGF0aCBkPSJNOTIgOTIgUTEwMCAxMDAgOTIgMTA4IE0xMDAgOTAgUTEwOCAxMDAgMTAwIDExMCBNMTA4IDkyIFExMTYgMTAwIDEwOCAxMDgiIHN0cm9rZT0iIzBlM2IyZSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==", category: "supermarket", subcategory: "Kahve" },
      { id: "p-27", storeId: "store-starbucks", name: "Starbucks Termos Bardak", price: 599, stock: 30, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTc4IDQwIEwxMjIgNDAgTDEyOCAxNTUgUTEyOCAxNjggMTAwIDE2OCBRNzIgMTY4IDcyIDE1NSBaIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiMwZTNiMmUiIHN0cm9rZS13aWR0aD0iNCIvPgo8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iNDAiIHJ4PSIyMiIgcnk9IjciIGZpbGw9IiMwZTNiMmUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iOTUiIHI9IjE2IiBmaWxsPSIjMGUzYjJlIi8+CjxwYXRoIGQ9Ik05MiA4OCBRMTAwIDk1IDkyIDEwMiBNMTA4IDg4IFExMDAgOTUgMTA4IDEwMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiLz4KPC9zdmc+", category: "ev-yasam", subcategory: "Bardak" },
      { id: "p-28", storeId: "store-kahvedunyasi", name: "Kahve Dünyası Türk Kahvesi 250g", price: 219, stock: 60, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHBhdGggZD0iTTYwIDQ1IEwxNDAgNDUgTDE0NCAxNjUgUTE0NCAxNzIgMTM3IDE3MiBMNjMgMTcyIFE1NiAxNzIgNTYgMTY1IFoiIGZpbGw9IiM2YjNhMWYiLz4KPHJlY3QgeD0iNzAiIHk9IjQ1IiB3aWR0aD0iNjAiIGhlaWdodD0iMTYiIGZpbGw9IiM0ZDJhMTUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTA1IiByPSIyNiIgZmlsbD0iI2YwZTRkMCIvPgo8dGV4dCB4PSIxMDAiIHk9IjExMyIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiM2ExZiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsc2VyaWYiPlRLPC90ZXh0Pgo8L3N2Zz4=", category: "supermarket", subcategory: "Kahve" },
      { id: "p-29", storeId: "store-kahvedunyasi", name: "Kahve Dünyası Kahve Değirmeni", price: 890, stock: 22, image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz4KPHJlY3QgeD0iNzUiIHk9IjkwIiB3aWR0aD0iNTAiIGhlaWdodD0iNzAiIHJ4PSI0IiBmaWxsPSIjOGE1YTM0Ii8+CjxyZWN0IHg9IjgyIiB5PSI1NSIgd2lkdGg9IjM2IiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iI2M5YTg3NiIvPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI3NSIgcj0iOCIgZmlsbD0iIzVjM2ExZSIvPgo8cmVjdCB4PSI5MCIgeT0iNDUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMiIgcng9IjIiIGZpbGw9IiM1YzNhMWUiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTMwIiByPSIxMCIgZmlsbD0iI2YwZTRkMCIvPgo8L3N2Zz4=", category: "elektronik", subcategory: "Küçük Ev Aletleri" },
    ],
    orders: [],
    subOrders: [],
    paymentSplits: [],
    orderCounter: 1000,
    productCounter: 29,
    storeCounter: 13,
    bannerCounter: 8,
    categories: [
      { id: "kadin", name: "Kadın", icon: "👗", groups: [
        { title: "Giyim", items: ["Elbise", "Tişört", "Gömlek", "Kot Pantolon", "Kot Ceket", "Pantolon", "Mont", "Kazak", "Ceket", "Etek"] },
        { title: "Aksesuar & Çanta", items: ["Çanta", "Saat", "Takı", "Cüzdan", "Atkı", "Kemer", "Şal"] },
        { title: "Kozmetik", items: ["Parfüm", "Göz Makyajı", "Cilt Bakım", "Saç Bakımı", "Makyaj"] },
        { title: "Ayakkabı", items: ["Topuklu Ayakkabı", "Sneaker", "Günlük Ayakkabı", "Babet", "Sandalet", "Bot"] },
        { title: "Ev & İç Giyim", items: ["Pijama Takımı", "Gecelik", "Sütyen", "İç Çamaşırı Takımları", "Çorap"] },
        { title: "Spor & Outdoor", items: ["Sweatshirt", "Spor Tişört", "Spor Sütyeni", "Tayt", "Eşofman"] },
      ]},
      { id: "erkek", name: "Erkek", icon: "👔", groups: [
        { title: "Giyim", items: ["Tişört", "Şort", "Gömlek", "Eşofman", "Pantolon", "Ceket", "Kot Pantolon", "Takım Elbise", "Kazak", "Mont"] },
        { title: "Ayakkabı", items: ["Spor Ayakkabı", "Günlük Ayakkabı", "Klasik Ayakkabı", "Bot", "Sneaker", "Loafer"] },
        { title: "Saat & Aksesuar", items: ["Saat", "Güneş Gözlüğü", "Cüzdan", "Kemer", "Kravat", "Şapka"] },
        { title: "Kişisel Bakım", items: ["Parfüm", "Tıraş Ürünleri", "Deodorant"] },
        { title: "Çanta", items: ["Sırt Çantası", "Spor Çantası", "Laptop Çantası", "Cüzdan"] },
        { title: "Spor & Outdoor", items: ["Eşofman", "Spor Ayakkabı", "T-shirt", "Sweatshirt"] },
      ]},
      { id: "anne-cocuk", name: "Anne & Çocuk", icon: "🧸", groups: [
        { title: "Bebek", items: ["Bebek Takımları", "Body & Zıbın", "Tulum", "Hastane Çıkışı", "Yenidoğan Kıyafetleri"] },
        { title: "Kız Çocuk", items: ["Elbise", "Sweatshirt", "Spor Ayakkabı", "Eşofman", "Tayt"] },
        { title: "Erkek Çocuk", items: ["Sweatshirt", "Spor Ayakkabı", "Şort", "Gömlek", "Pantolon"] },
        { title: "Bebek Bakım", items: ["Bebek Bezi", "Bebek Şampuanı", "Krem & Yağlar", "Islak Mendil"] },
        { title: "Oyuncak", items: ["Eğitici Oyuncaklar", "Oyuncak Araba", "Oyuncak Bebek", "Kumandalı Oyuncak"] },
      ]},
      { id: "ev-yasam", name: "Ev & Yaşam", icon: "🏠", groups: [
        { title: "Sofra & Mutfak", items: ["Yemek Takımı", "Çatal Kaşık Bıçak Seti", "Bardak", "Tencere Seti", "Baharat Takımı"] },
        { title: "Banyo", items: ["Havlu & Havlu Seti", "Bornoz", "Banyo Seti", "Banyo Paspası"] },
        { title: "Ev Tekstili", items: ["Nevresim Takımı", "Yastık", "Perde", "Battaniye", "Halı & Kilim"] },
        { title: "Ev Dekorasyon", items: ["Dekoratif Aksesuar", "Tablo", "Aydınlatma", "Ayna", "Oda Kokusu"] },
        { title: "Mobilya", items: ["Oturma Grupları", "Yatak Odası", "Sandalye", "Çalışma Odası"] },
      ]},
      { id: "supermarket", name: "Süpermarket", icon: "🛒", groups: [
        { title: "Ev & Temizlik", items: ["Çamaşır Deterjanı", "Yumuşatıcı", "Temizlik Bezi", "Bulaşık Deterjanı"] },
        { title: "Kişisel Bakım", items: ["Şampuan", "Sabun", "Diş Macunu", "Deodorant"] },
        { title: "Gıda", items: ["Çay", "Kahve", "Atıştırmalık", "Kuru Gıda", "Kahvaltılık"] },
        { title: "Petshop", items: ["Kedi Maması", "Köpek Maması", "Kedi Kumu", "Kuş Ürünleri"] },
      ]},
      { id: "kozmetik", name: "Kozmetik", icon: "💄", groups: [
        { title: "Makyaj", items: ["Fondöten", "Ruj", "Maskara", "Far Paleti", "Kapatıcı"] },
        { title: "Cilt Bakımı", items: ["Yüz Kremi", "Cilt Serumu", "Yüz Temizleme", "Yüz Maskesi"] },
        { title: "Saç Bakımı", items: ["Şampuan", "Saç Boyası", "Saç Kremi", "Saç Maskesi"] },
        { title: "Parfüm", items: ["Kadın Parfüm", "Erkek Parfüm", "Parfüm Seti"] },
      ]},
      { id: "ayakkabi-canta", name: "Ayakkabı & Çanta", icon: "👠", groups: [
        { title: "Kadın Ayakkabı", items: ["Spor Ayakkabı", "Topuklu Ayakkabı", "Bot", "Sandalet", "Babet"] },
        { title: "Erkek Ayakkabı", items: ["Spor Ayakkabı", "Klasik Ayakkabı", "Bot", "Sneaker"] },
        { title: "Çanta", items: ["Omuz Çantası", "Sırt Çantası", "Cüzdan", "El Çantası"] },
        { title: "Çocuk Ayakkabı", items: ["Spor Ayakkabı", "Sandalet", "Babet", "Bot"] },
      ]},
      { id: "elektronik", name: "Elektronik", icon: "📱", groups: [
        { title: "Telefon", items: ["Cep Telefonu", "Kapak & Kılıf", "Şarj Cihazları", "Powerbank"] },
        { title: "Bilgisayar & Tablet", items: ["Laptop", "Tablet", "Mouse", "Klavye", "Monitör"] },
        { title: "TV & Ses", items: ["Televizyon", "Kulaklık", "Hoparlör", "Soundbar"] },
        { title: "Küçük Ev Aletleri", items: ["Süpürge", "Kahve Makinesi", "Ütü", "Airfryer & Fritöz"] },
      ]},
      { id: "saat-aksesuar", name: "Saat & Aksesuar", icon: "⌚", groups: [
        { title: "Kadın", items: ["Saat", "Takı & Mücevher", "Güneş Gözlüğü", "Saç Aksesuarı"] },
        { title: "Erkek", items: ["Saat", "Kravat", "Kemer", "Güneş Gözlüğü"] },
        { title: "Elektronik Aksesuar", items: ["Akıllı Saat", "Akıllı Bileklik", "Telefon Kılıfı"] },
      ]},
      { id: "spor-outdoor", name: "Spor & Outdoor", icon: "⚽", groups: [
        { title: "Spor Giyim", items: ["Eşofman Takımı", "Tayt", "Sweatshirt", "Spor Şort"] },
        { title: "Spor Ayakkabı", items: ["Koşu Ayakkabısı", "Basketbol Ayakkabısı", "Outdoor Ayakkabı"] },
        { title: "Fitness", items: ["Dambıl Seti", "Yoga Matı", "Direnç Lastiği", "Atlama İpi"] },
        { title: "Outdoor", items: ["Çadır", "Uyku Tulumu", "Termos", "Kamp Malzemeleri"] },
      ]},
    ],
    banners: [
      { id: "hero-1", zone: "hero", title: "Beymen, Koton, Adil Işık, Altınyıldız — tek sepette!", subtitle: "Farklı mağazalardan seçtiğin ürünler için tek ödeme yaparsın, her mağaza kendi kargosunu kendi yollar.", cta: "Alışverişe Başla", link: "index.html", gradient: "linear-gradient(120deg, #f27a1a 0%, #ff9a4d 100%)", emoji: "🛍️" },
      { id: "hero-2", zone: "hero", title: "Beymen'de Seçili Ürünlerde %30'a Varan İndirim", subtitle: "Klasik ve şık parçalar, markabahçem güvencesiyle kapına gelir.", cta: "Beymen'i Gör", link: "index.html?store=beymen", gradient: "linear-gradient(120deg, #1a1a2e 0%, #533483 100%)", emoji: "🕴️" },
      { id: "hero-3", zone: "hero", title: "Koton Yeni Sezon Koleksiyonu Burada", subtitle: "Genç, rahat, uygun fiyatlı — yeni sezon parçaları keşfet.", cta: "Koton'u Gör", link: "index.html?store=koton", gradient: "linear-gradient(120deg, #c31432 0%, #d76d77 50%, #ffaf7b 100%)", emoji: "👖" },
      { id: "strip-1", zone: "strip3", title: "Kargo Bedava Kampanyası", subtitle: "500 ₺ üzeri siparişlerde", emoji: "🚚", gradient: "linear-gradient(135deg, #11998e, #38ef7d)", link: "index.html" },
      { id: "strip-2", zone: "strip3", title: "Altınyıldız Kış Koleksiyonu", subtitle: "Kaban ve gömlekte yeni sezon", emoji: "🧥", gradient: "linear-gradient(135deg, #2c3e50, #4ca1af)", link: "index.html?store=altinyildiz" },
      { id: "strip-3", zone: "strip3", title: "Adil Işık ile Ofis Şıklığı", subtitle: "Takım elbise ve gömlekte seçenekler", emoji: "👔", gradient: "linear-gradient(135deg, #8e7355, #d4b896)", link: "index.html?store=adilisik" },
      { id: "strip-4", zone: "strip3", title: "Arçelik & Media Markt Elektronik", subtitle: "Küçük ev aletlerinde ve teknolojide fırsatlar", emoji: "🔌", gradient: "linear-gradient(135deg, #1e3c72, #2a5298)", link: "category.html?cat=elektronik" },
      { id: "mid-1", zone: "midpage", title: "markabahçem Güven Kalkanı", subtitle: "Ödemen bize emanet, ürünün mağazadan — tek ödeme, otomatik bölünen güvenli sistem.", emoji: "🛡️", gradient: "linear-gradient(120deg, #134e5e 0%, #71b280 100%)", link: "#" },
    ],
  };

  // ---------- DB YÜKLE / KAYDET ----------
  // SEED_VERSION: Her yeni mağaza/ürün/kategori eklendiğinde bu sayı artırılır.
  // Böylece daha önce siteyi ziyaret etmiş kullanıcıların tarayıcısındaki eski veri
  // otomatik olarak yeni mağaza/ürünlerle "birleştirilir" (merge) — kullanıcının
  // kendi eklediği/düzenlediği hiçbir şey silinmez, sadece eksik olanlar eklenir.
  const SEED_VERSION = 6;

  function loadDB() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const existing = JSON.parse(raw);
        if (existing.seedVersion === SEED_VERSION) return existing;
        return mergeSeedIntoExisting(existing);
      }
    } catch (e) {}
    const fresh = JSON.parse(JSON.stringify(SEED));
    fresh.seedVersion = SEED_VERSION;
    saveDB(fresh);
    return fresh;
  }

  function mergeSeedIntoExisting(existing) {
    existing.stores = existing.stores || [];
    existing.products = existing.products || [];
    existing.banners = existing.banners || [];

    const existingStoreIds = new Set(existing.stores.map((s) => s.id));
    SEED.stores.forEach((s) => {
      if (!existingStoreIds.has(s.id)) existing.stores.push(JSON.parse(JSON.stringify(s)));
    });

    const existingProductIds = new Set(existing.products.map((p) => p.id));
    SEED.products.forEach((p) => {
      if (!existingProductIds.has(p.id)) existing.products.push(JSON.parse(JSON.stringify(p)));
    });

    const existingBannerIds = new Set(existing.banners.map((b) => b.id));
    SEED.banners.forEach((b) => {
      if (!existingBannerIds.has(b.id)) existing.banners.push(JSON.parse(JSON.stringify(b)));
    });

    // Kategori taksonomisi her zaman en güncel haliyle senkronize edilir
    existing.categories = JSON.parse(JSON.stringify(SEED.categories));

    // Sayaçları senkronize et, yeni eklenen kayıtlarla çakışma olmasın
    existing.storeCounter = Math.max(existing.storeCounter || 0, SEED.storeCounter);
    existing.productCounter = Math.max(existing.productCounter || 0, SEED.productCounter);
    existing.bannerCounter = Math.max(existing.bannerCounter || 0, SEED.bannerCounter);
    existing.orderCounter = existing.orderCounter || SEED.orderCounter;

    if (!existing.siteSettings) existing.siteSettings = JSON.parse(JSON.stringify(SEED.siteSettings));

    existing.seedVersion = SEED_VERSION;
    saveDB(existing);
    return existing;
  }

  function saveDB(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      throw new Error("STORAGE_FULL: Tarayıcı depolama alanı dolu. Bir görseli silip tekrar dene, ya da daha küçük bir dosya yükle.");
    }
  }

  let db = loadDB();

  function getStore(id) { return db.stores.find((s) => s.id === id); }
  function getProduct(id) { return db.products.find((p) => p.id === id); }

  // ---------- YARDIMCI: mock Response nesnesi ----------
  function jsonResponse(body, status) {
    status = status || 200;
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
  }

  // ---------- ROUTE HANDLER'LARI ----------
  function handleGetProducts() {
    return db.products.map((p) => {
      const store = getStore(p.storeId);
      return { ...p, storeName: store.name, storeSlug: store.slug };
    });
  }

  function handleGetProduct(id) {
    const product = getProduct(id);
    if (!product) return null;
    const store = getStore(product.storeId);
    const otherProducts = db.products
      .filter((p) => p.storeId === product.storeId && p.id !== product.id)
      .map((p) => ({ ...p, storeName: store.name, storeSlug: store.slug }));
    return { product: { ...product, storeName: store.name, storeSlug: store.slug }, otherProducts };
  }

  function handleGetStores() {
    return db.stores.filter((s) => s.status === "active");
  }

  function handleGetStoreProfile(slug) {
    const store = db.stores.find((s) => s.slug === slug);
    if (!store) return null;
    const products = db.products.filter((p) => p.storeId === store.id).map((p) => ({ ...p, storeName: store.name, storeSlug: store.slug }));
    return { store, products };
  }

  function handleUpdateStoreProfile(id, body) {
    const store = getStore(id);
    if (!store) return { status: 404, body: { error: "Mağaza bulunamadı" } };
    if (body.logoImage !== undefined) store.logoImage = body.logoImage;
    if (body.bannerImage !== undefined) store.bannerImage = body.bannerImage;
    if (body.description !== undefined) store.description = body.description;
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  function handleGetPartnerStores() {
    return db.stores.filter((s) => s.status === "active" || s.status === "paused");
  }

  function handleGetAdminStores() {
    return db.stores;
  }

  function handleGetCategories() {
    return db.categories;
  }

  function handleGetBanners(zone) {
    return zone ? db.banners.filter((b) => b.zone === zone) : db.banners;
  }

  function handleAddBanner(body) {
    db.bannerCounter += 1;
    const banner = {
      id: `promo-${db.bannerCounter}`,
      zone: body.zone || "strip3",
      title: body.title || "",
      subtitle: body.subtitle || "",
      cta: body.cta || "",
      link: body.link || "#",
      emoji: body.emoji || "🛍️",
      gradient: body.gradient || "linear-gradient(135deg,#f27a1a,#ffb066)",
      image: body.image || null,
    };
    db.banners.push(banner);
    saveDB(db);
    return { status: 200, body: { success: true, banner } };
  }

  function handleUpdateBanner(id, body) {
    const banner = db.banners.find((b) => b.id === id);
    if (!banner) return { status: 404, body: { error: "Banner bulunamadı" } };
    ["title", "subtitle", "cta", "link", "emoji", "gradient", "image", "zone"].forEach((key) => {
      if (body[key] !== undefined) banner[key] = body[key];
    });
    saveDB(db);
    return { status: 200, body: { success: true, banner } };
  }

  function handleDeleteBanner(id) {
    const idx = db.banners.findIndex((b) => b.id === id);
    if (idx === -1) return { status: 404, body: { error: "Banner bulunamadı" } };
    db.banners.splice(idx, 1);
    saveDB(db);
    return { status: 200, body: { success: true } };
  }

  function handleGetSiteSettings() {
    return db.siteSettings || { logoImage: null, logoText: "markabahçem" };
  }

  function handleUpdateSiteSettings(body) {
    db.siteSettings = db.siteSettings || {};
    if (body.logoImage !== undefined) db.siteSettings.logoImage = body.logoImage;
    if (body.logoText !== undefined) db.siteSettings.logoText = body.logoText;
    saveDB(db);
    return { status: 200, body: { success: true, siteSettings: db.siteSettings } };
  }

  function handleGetMegaMenu() {
    return db.stores.map((store) => ({
      id: store.id,
      slug: store.slug,
      name: store.name,
      products: db.products.filter((p) => p.storeId === store.id).map((p) => ({ id: p.id, name: p.name })),
    }));
  }

  // ---- CHECKOUT (split payment simülasyonu) ----
  function handleCheckout(body) {
    const cartItems = body.cartItems || [];
    if (cartItems.length === 0) return { status: 400, body: { success: false, error: "Sepet boş" } };

    const grouped = {};
    for (const item of cartItems) {
      const product = getProduct(item.productId);
      if (!product) return { status: 400, body: { success: false, error: `Ürün bulunamadı: ${item.productId}` } };
      if (item.quantity > product.stock) {
        return { status: 400, body: { success: false, error: `${product.name} için yetersiz stok` } };
      }
      if (!grouped[product.storeId]) grouped[product.storeId] = [];
      grouped[product.storeId].push({ product, quantity: item.quantity, lineTotal: product.price * item.quantity });
    }

    const breakdowns = Object.entries(grouped).map(([storeId, items]) => {
      const store = getStore(storeId);
      const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
      const commission = Math.round(subtotal * (store.commissionRate / 100) * 100) / 100;
      const payout = Math.round((subtotal - commission) * 100) / 100;
      return { store, items, subtotal, commission, payout };
    });

    const orderTotal = breakdowns.reduce((s, b) => s + b.subtotal, 0);
    const totalCommission = breakdowns.reduce((s, b) => s + b.commission, 0);

    const success = Math.random() > 0.02;
    if (!success) {
      return { status: 402, body: { success: false, error: "Kart bankası tarafından reddedildi (simüle edilmiş hata)" } };
    }

    db.orderCounter += 1;
    const orderNumber = `MB-2026-${db.orderCounter}`;
    const providerPaymentId = `SIM-PAY-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

    const order = {
      id: "order-" + Date.now(),
      orderNumber,
      customer: body.customer,
      shippingAddress: body.shippingAddress,
      totalAmount: orderTotal,
      totalCommission,
      status: "paid",
      providerPaymentId,
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);

    const createdSubOrders = breakdowns.map((b, idx) => {
      const suffix = String.fromCharCode(65 + idx);
      const subOrder = {
        id: "suborder-" + Date.now() + "-" + idx,
        orderId: order.id,
        storeId: b.store.id,
        storeName: b.store.name,
        subOrderNumber: `${orderNumber}-${suffix}`,
        items: b.items.map((i) => ({ productId: i.product.id, productName: i.product.name, unitPrice: i.product.price, quantity: i.quantity, lineTotal: i.lineTotal })),
        subtotal: b.subtotal,
        commission: b.commission,
        payout: b.payout,
        status: "confirmed_by_store",
        externalOrderId: `${b.store.slug.toUpperCase()}-EXT-${Math.random().toString(16).slice(2, 8)}`,
        trackingNumber: null,
        createdAt: new Date().toISOString(),
      };

      b.items.forEach((i) => {
        const product = getProduct(i.product.id);
        product.stock -= i.quantity;
      });

      db.subOrders.push(subOrder);

      db.paymentSplits.push({
        id: "split-" + Date.now() + "-" + idx,
        orderId: order.id,
        subOrderId: subOrder.id,
        storeId: b.store.id,
        grossAmount: b.subtotal,
        commissionAmount: b.commission,
        netPayoutAmount: b.payout,
        subMerchantKey: b.store.subMerchantKey,
        settlementStatus: "settled",
        createdAt: new Date().toISOString(),
      });

      return subOrder;
    });

    saveDB(db);
    return { status: 200, body: { success: true, order, subOrders: createdSubOrders, providerPaymentId } };
  }

  function handleGetOrder(orderNumber) {
    const order = db.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return null;
    const subOrders = db.subOrders.filter((so) => so.orderId === order.id);
    return { order, subOrders };
  }

  function handleGetStoreOrders(slug) {
    const store = db.stores.find((s) => s.slug === slug);
    if (!store) return null;
    const subOrders = db.subOrders
      .filter((so) => so.storeId === store.id)
      .map((so) => ({ ...so, paymentSplit: db.paymentSplits.find((ps) => ps.subOrderId === so.id) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { store, subOrders };
  }

  function handleAdminSummary() {
    const totalRevenue = db.orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCommission = db.orders.reduce((s, o) => s + o.totalCommission, 0);
    const byStore = db.stores.map((store) => {
      const splits = db.paymentSplits.filter((ps) => ps.storeId === store.id);
      return {
        storeName: store.name,
        orderCount: splits.length,
        grossSales: splits.reduce((s, x) => s + x.grossAmount, 0),
        commissionEarned: splits.reduce((s, x) => s + x.commissionAmount, 0),
        payoutOwed: splits.reduce((s, x) => s + x.netPayoutAmount, 0),
      };
    });
    return { totalOrders: db.orders.length, totalRevenue, totalCommission, byStore };
  }

  function handlePartnerApply(body) {
    if (!body.name || !body.contactEmail) return { status: 400, body: { error: "İşletme adı ve e-posta zorunlu" } };
    db.storeCounter += 1;
    const slugBase = body.name.toLowerCase()
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const store = {
      id: `store-${slugBase}-${db.storeCounter}`,
      name: body.name,
      slug: `${slugBase}-${db.storeCounter}`,
      commissionRate: Number(body.commissionRate) || 15,
      subMerchantKey: null,
      status: "pending",
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      appliedAt: new Date().toISOString(),
    };
    db.stores.push(store);
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  function handleGetPartnerProducts(storeId) {
    return db.products.filter((p) => p.storeId === storeId);
  }

  function handleAddProduct(storeId, body) {
    if (!body.name || !body.price) return { status: 400, body: { error: "Ürün adı ve fiyat zorunlu" } };
    db.productCounter += 1;
    const product = {
      id: `p-${db.productCounter}`,
      storeId,
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock) || 0,
      image: body.image || "📦",
      category: body.category || null,
      subcategory: body.subcategory || null,
    };
    db.products.push(product);
    saveDB(db);
    return { status: 200, body: { success: true, product } };
  }

  function handleUpdateProduct(productId, body) {
    const product = getProduct(productId);
    if (!product) return { status: 404, body: { error: "Ürün bulunamadı" } };
    if (body.name !== undefined) product.name = body.name;
    if (body.price !== undefined) product.price = Number(body.price);
    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.image !== undefined) product.image = body.image;
    if (body.category !== undefined) product.category = body.category;
    if (body.subcategory !== undefined) product.subcategory = body.subcategory;
    saveDB(db);
    return { status: 200, body: { success: true, product } };
  }

  function handleDeleteProduct(productId) {
    const idx = db.products.findIndex((p) => p.id === productId);
    if (idx === -1) return { status: 404, body: { error: "Ürün bulunamadı" } };
    db.products.splice(idx, 1);
    saveDB(db);
    return { status: 200, body: { success: true } };
  }

  function handleApproveStore(id) {
    const store = getStore(id);
    if (!store) return { status: 404, body: { error: "Mağaza bulunamadı" } };
    store.status = "active";
    store.subMerchantKey = `SIM-SUBMERCHANT-${store.slug.toUpperCase()}`;
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  function handleRejectStore(id) {
    const store = getStore(id);
    if (!store) return { status: 404, body: { error: "Mağaza bulunamadı" } };
    store.status = "rejected";
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  function handleTogglePause(id) {
    const store = getStore(id);
    if (!store) return { status: 404, body: { error: "Mağaza bulunamadı" } };
    store.status = store.status === "paused" ? "active" : "paused";
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  function handleUpdateCommission(id, body) {
    const store = getStore(id);
    if (!store) return { status: 404, body: { error: "Mağaza bulunamadı" } };
    store.commissionRate = Number(body.rate);
    saveDB(db);
    return { status: 200, body: { success: true, store } };
  }

  // ---------- FETCH OVERRIDE ----------
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (url, init) {
    init = init || {};
    const method = (init.method || "GET").toUpperCase();

    if (typeof url !== "string" || !url.startsWith("/api/")) {
      return originalFetch(url, init);
    }

    try {
    const [pathPart, queryPart] = url.split("?");
    const query = new URLSearchParams(queryPart || "");
    const segments = pathPart.replace("/api/", "").split("/").filter(Boolean);
    const body = init.body ? JSON.parse(init.body) : {};

    // GET /products
    if (method === "GET" && segments[0] === "products" && segments.length === 1) {
      return jsonResponse(handleGetProducts());
    }
    // GET /products/:id
    if (method === "GET" && segments[0] === "products" && segments.length === 2) {
      const result = handleGetProduct(segments[1]);
      return result ? jsonResponse(result) : jsonResponse({ error: "Ürün bulunamadı" }, 404);
    }
    // GET /stores
    if (method === "GET" && segments[0] === "stores" && segments.length === 1) {
      return jsonResponse(handleGetStores());
    }
    // GET /stores/:slug/orders
    if (method === "GET" && segments[0] === "stores" && segments[2] === "orders") {
      const result = handleGetStoreOrders(segments[1]);
      return result ? jsonResponse(result) : jsonResponse({ error: "Mağaza bulunamadı" }, 404);
    }
    // GET /stores/:slug/profile
    if (method === "GET" && segments[0] === "stores" && segments[2] === "profile") {
      const result = handleGetStoreProfile(segments[1]);
      return result ? jsonResponse(result) : jsonResponse({ error: "Mağaza bulunamadı" }, 404);
    }
    // PUT /stores/:id/profile (partner panelinden logo/banner/açıklama güncelleme)
    if (method === "PUT" && segments[0] === "stores" && segments[2] === "profile") {
      const result = handleUpdateStoreProfile(segments[1], body);
      return jsonResponse(result.body, result.status);
    }
    // POST /checkout
    if (method === "POST" && segments[0] === "checkout") {
      const result = handleCheckout(body);
      return jsonResponse(result.body, result.status);
    }
    // GET /orders/:orderNumber
    if (method === "GET" && segments[0] === "orders" && segments.length === 2) {
      const result = handleGetOrder(segments[1]);
      return result ? jsonResponse(result) : jsonResponse({ error: "Sipariş bulunamadı" }, 404);
    }
    // GET /categories
    if (method === "GET" && segments[0] === "categories") {
      return jsonResponse(handleGetCategories());
    }
    // GET /banners
    if (method === "GET" && segments[0] === "banners") {
      return jsonResponse(handleGetBanners(query.get("zone")));
    }
    // POST /banners
    if (method === "POST" && segments[0] === "banners" && segments.length === 1) {
      const result = handleAddBanner(body);
      return jsonResponse(result.body, result.status);
    }
    // PUT /banners/:id
    if (method === "PUT" && segments[0] === "banners" && segments.length === 2) {
      const result = handleUpdateBanner(segments[1], body);
      return jsonResponse(result.body, result.status);
    }
    // DELETE /banners/:id
    if (method === "DELETE" && segments[0] === "banners" && segments.length === 2) {
      const result = handleDeleteBanner(segments[1]);
      return jsonResponse(result.body, result.status);
    }
    // GET /site-settings
    if (method === "GET" && segments[0] === "site-settings") {
      return jsonResponse(handleGetSiteSettings());
    }
    // PUT /site-settings
    if (method === "PUT" && segments[0] === "site-settings") {
      const result = handleUpdateSiteSettings(body);
      return jsonResponse(result.body, result.status);
    }
    // GET /mega-menu
    if (method === "GET" && segments[0] === "mega-menu") {
      return jsonResponse(handleGetMegaMenu());
    }
    // GET /admin/summary
    if (method === "GET" && segments[0] === "admin" && segments[1] === "summary") {
      return jsonResponse(handleAdminSummary());
    }
    // GET /admin/stores
    if (method === "GET" && segments[0] === "admin" && segments[1] === "stores" && segments.length === 2) {
      return jsonResponse(handleGetAdminStores());
    }
    // POST /admin/stores/:id/approve
    if (method === "POST" && segments[0] === "admin" && segments[1] === "stores" && segments[3] === "approve") {
      const result = handleApproveStore(segments[2]);
      return jsonResponse(result.body, result.status);
    }
    // POST /admin/stores/:id/reject
    if (method === "POST" && segments[0] === "admin" && segments[1] === "stores" && segments[3] === "reject") {
      const result = handleRejectStore(segments[2]);
      return jsonResponse(result.body, result.status);
    }
    // POST /admin/stores/:id/toggle-pause
    if (method === "POST" && segments[0] === "admin" && segments[1] === "stores" && segments[3] === "toggle-pause") {
      const result = handleTogglePause(segments[2]);
      return jsonResponse(result.body, result.status);
    }
    // PUT /admin/stores/:id/commission
    if (method === "PUT" && segments[0] === "admin" && segments[1] === "stores" && segments[3] === "commission") {
      const result = handleUpdateCommission(segments[2], body);
      return jsonResponse(result.body, result.status);
    }
    // GET /partner/stores
    if (method === "GET" && segments[0] === "partner" && segments[1] === "stores") {
      return jsonResponse(handleGetPartnerStores());
    }
    // POST /partner/apply
    if (method === "POST" && segments[0] === "partner" && segments[1] === "apply") {
      const result = handlePartnerApply(body);
      return jsonResponse(result.body, result.status);
    }
    // GET /partner/:storeId/products
    if (method === "GET" && segments[0] === "partner" && segments[2] === "products") {
      return jsonResponse(handleGetPartnerProducts(segments[1]));
    }
    // POST /partner/:storeId/products
    if (method === "POST" && segments[0] === "partner" && segments[2] === "products") {
      const result = handleAddProduct(segments[1], body);
      return jsonResponse(result.body, result.status);
    }
    // PUT /partner/products/:productId
    if (method === "PUT" && segments[0] === "partner" && segments[1] === "products") {
      const result = handleUpdateProduct(segments[2], body);
      return jsonResponse(result.body, result.status);
    }
    // DELETE /partner/products/:productId
    if (method === "DELETE" && segments[0] === "partner" && segments[1] === "products") {
      const result = handleDeleteProduct(segments[2]);
      return jsonResponse(result.body, result.status);
    }

    // Eşleşmeyen route
    return jsonResponse({ error: "Bilinmeyen endpoint: " + url }, 404);
    } catch (e) {
      const msg = (e && e.message) || String(e);
      return jsonResponse({ success: false, error: msg.replace("STORAGE_FULL: ", "") }, 500);
    }
  };

  // Global debug/reset yardımcı fonksiyonu (konsoldan: resetMarkabahcemDemo())
  window.resetMarkabahcemDemo = function () {
    localStorage.removeItem(DB_KEY);
    location.reload();
  };
})();
