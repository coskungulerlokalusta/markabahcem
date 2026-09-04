/* ============================================================
   markabahçem — static-api.js
   Gerçek bir backend YOKTUR. Bu dosya window.fetch()'i override
   ederek /api/... isteklerine sahte cevaplar üretir. Tüm veri
   tarayıcının localStorage'ında tek bir JSON nesnesi olarak
   tutulur (anahtar: markabahcem_static_db). Bu nedenle veriler
   SADECE bu tarayıcı/cihazda görünür; iki farklı kullanıcı
   birbirinin sepetini/siparişini/logosunu ASLA göremez.
   ============================================================ */
(function(){
  const DB_KEY = "markabahcem_static_db";
  const LATENCY = 220; // ms - gerçekçi ağ gecikmesi hissi için

  const SEED = {
    categories: [
      { id: "kadin", name: "Kadın", emoji: "👗" },
      { id: "erkek", name: "Erkek", emoji: "👔" },
      { id: "ayakkabi-canta", name: "Ayakkabı & Çanta", emoji: "👜" },
      { id: "elektronik", name: "Elektronik", emoji: "📱" },
      { id: "ev-yasam", name: "Ev & Yaşam", emoji: "🛋️" },
      { id: "kozmetik", name: "Kozmetik & Parfüm", emoji: "💄" },
      { id: "saat-aksesuar", name: "Saat & Aksesuar", emoji: "⌚" },
      { id: "supermarket", name: "Süpermarket & Kafe", emoji: "☕" }
    ],
    stores: [
      { id: "beymen", name: "Beymen", emoji: "🛍️", logo: null, banner: null,
        desc: "Türkiye'nin köklü lüks moda mağazası. Yerli ve yabancı premium markaları bir araya getirir.",
        commissionRate: 12, status: "active", categories: ["kadin","erkek","ayakkabi-canta"] },
      { id: "vakko", name: "Vakko", emoji: "🧣", logo: null, banner: null,
        desc: "1934'ten beri Türk modasının öncü ismi. İpek ürünleri ve şıklığıyla tanınır.",
        commissionRate: 12, status: "active", categories: ["kadin","erkek","ev-yasam"] },
      { id: "koton", name: "Koton", emoji: "👕", logo: null, banner: null,
        desc: "Genç ve dinamik, güncel trendleri uygun fiyatla sunan hazır giyim markası.",
        commissionRate: 10, status: "active", categories: ["kadin","erkek"] },
      { id: "adil-isik", name: "Adil Işık", emoji: "🥿", logo: null, banner: null,
        desc: "1950'den beri Türkiye'nin ayakkabı ve çanta konusunda güvenilir adresi.",
        commissionRate: 11, status: "active", categories: ["ayakkabi-canta"] },
      { id: "altinyildiz", name: "Altınyıldız Classics", emoji: "🧥", logo: null, banner: null,
        desc: "Klasik ve şık erkek giyiminde Türkiye'nin en tanınan markalarından.",
        commissionRate: 10, status: "active", categories: ["erkek"] },
      { id: "lcw", name: "LC Waikiki", emoji: "🩳", logo: null, banner: null,
        desc: "Aile giyiminde uygun fiyat ve geniş ürün yelpazesiyle öne çıkan marka.",
        commissionRate: 9, status: "active", categories: ["kadin","erkek","ev-yasam"] },
      { id: "arcelik", name: "Arçelik", emoji: "🧊", logo: null, banner: null,
        desc: "Beyaz eşya ve ev elektroniğinde Türkiye'nin lider markası.",
        commissionRate: 8, status: "active", categories: ["ev-yasam","elektronik"] },
      { id: "mediamarkt", name: "Media Markt", emoji: "💻", logo: null, banner: null,
        desc: "Elektronik ve teknoloji ürünlerinde geniş seçenek sunan mağaza zinciri.",
        commissionRate: 7, status: "active", categories: ["elektronik"] },
      { id: "zara", name: "Zara", emoji: "🧵", logo: null, banner: null,
        desc: "Güncel moda trendlerini hızla vitrine taşıyan global hazır giyim markası.",
        commissionRate: 13, status: "active", categories: ["kadin","erkek","ayakkabi-canta"] },
      { id: "hm", name: "H&M", emoji: "👖", logo: null, banner: null,
        desc: "Uygun fiyatlı, trend odaklı ve sürdürülebilir moda anlayışıyla bilinir.",
        commissionRate: 11, status: "active", categories: ["kadin","erkek"] },
      { id: "atasay", name: "Atasay", emoji: "💍", logo: null, banner: null,
        desc: "Türkiye'nin önde gelen mücevher ve altın takı markası.",
        commissionRate: 9, status: "active", categories: ["saat-aksesuar"] },
      { id: "atasun", name: "Atasun Optik", emoji: "🕶️", logo: null, banner: null,
        desc: "Gözlük ve göz sağlığında Türkiye genelinde geniş şube ağına sahip marka.",
        commissionRate: 10, status: "active", categories: ["saat-aksesuar"] },
      { id: "starbucks", name: "Starbucks", emoji: "☕", logo: null, banner: null,
        desc: "Dünyaca ünlü kahve zinciri — hediye kartı ve kahve ekipmanları.",
        commissionRate: 6, status: "active", categories: ["supermarket"] },
      { id: "kahve-dunyasi", name: "Kahve Dünyası", emoji: "🫘", logo: null, banner: null,
        desc: "Türk kahvesi geleneğini modern sunumla buluşturan yerli marka.",
        commissionRate: 6, status: "active", categories: ["supermarket"] }
    ],
    // Bekleyen partner başvuruları (admin panelinde onay/red bekler)
    applications: [
      { id: "app-1", brandName: "Mavi", contactName: "Elif Yalçın", email: "elif@mavi.com", phone: "0530 000 00 00",
        category: "kadin", message: "Mavi jeans olarak markabahçem'de yer almak istiyoruz.", status: "pending", date: "2026-08-20" },
      { id: "app-2", brandName: "Watsons", contactName: "Burak Sarı", email: "burak@watsons.com.tr", phone: "0532 111 22 33",
        category: "kozmetik", message: "Kozmetik kategorisinde güçlü bir katılımcı olabiliriz.", status: "pending", date: "2026-08-27" }
    ],
    products: [],
    banners: [
      { id: "b1", title: "Sonbahar Koleksiyonu %30'a Varan İndirim", sub: "Beymen, Zara ve H&M'de seçili ürünlerde", cta: "Alışverişe Başla", link: "category.html?cat=kadin", color: "#f27a1a" },
      { id: "b2", title: "Elektronikte Kampanya Zamanı", sub: "Media Markt'ta akıllı telefon ve laptoplarda fırsat", cta: "Ürünleri Gör", link: "category.html?cat=elektronik", color: "#24272b" },
      { id: "b3", title: "Sadece Bildiğin Markalar, Karmaşa Yok", sub: "markabahçem'de yalnızca köklü, güvenilir markalar var", cta: "Markaları Keşfet", link: "index.html", color: "#1ba672" }
    ],
    siteSettings: { logo: null, updatedAt: null },
    orders: [],
    users: [
      { id: "u-demo", name: "Demo Kullanıcı", email: "demo@markabahcem.com", password: "123456" }
    ],
    partners: [
      // Her markanın giriş bilgisi: {marka-id}@markabahcem.com / 123456
      { storeId: "beymen", email: "beymen@markabahcem.com", password: "123456" },
      { storeId: "vakko", email: "vakko@markabahcem.com", password: "123456" },
      { storeId: "koton", email: "koton@markabahcem.com", password: "123456" },
      { storeId: "adil-isik", email: "adil-isik@markabahcem.com", password: "123456" },
      { storeId: "altinyildiz", email: "altinyildiz@markabahcem.com", password: "123456" },
      { storeId: "lcw", email: "lcw@markabahcem.com", password: "123456" },
      { storeId: "arcelik", email: "arcelik@markabahcem.com", password: "123456" },
      { storeId: "mediamarkt", email: "mediamarkt@markabahcem.com", password: "123456" },
      { storeId: "zara", email: "zara@markabahcem.com", password: "123456" },
      { storeId: "hm", email: "hm@markabahcem.com", password: "123456" },
      { storeId: "atasay", email: "atasay@markabahcem.com", password: "123456" },
      { storeId: "atasun", email: "atasun@markabahcem.com", password: "123456" },
      { storeId: "starbucks", email: "starbucks@markabahcem.com", password: "123456" },
      { storeId: "kahve-dunyasi", email: "kahve-dunyasi@markabahcem.com", password: "123456" }
    ],
    admin: { email: "admin@markabahcem.com", password: "admin123" },
    session: null,        // { type: "customer", userId }
    partnerSession: null, // { storeId }
    adminSession: null    // { active: true }
  };

  const PRODUCT_NAMES = {
    kadin: ["Kadın Trençkot","Kadın Örme Kazak","Kadın Midi Elbise","Kadın Yüksek Bel Pantolon","Kadın Blazer Ceket","Kadın Saten Gömlek","Kadın Triko Hırka","Kadın Kot Ceket"],
    erkek: ["Erkek Slim Fit Gömlek","Erkek Yün Karışımlı Kaban","Erkek Chino Pantolon","Erkek Polo Yaka Tişört","Erkek Deri Ceket","Erkek Klasik Takım Elbise","Erkek Sweatshirt","Erkek Kazak"],
    "ayakkabi-canta": ["Deri Loafer","Topuklu Ayakkabı","Spor Ayakkabı","Deri Sırt Çantası","El Çantası","Bot","Sneaker","Evrak Çantası"],
    elektronik: ["Kablosuz Kulaklık","Akıllı Saat","4K Televizyon","Dizüstü Bilgisayar","Akıllı Telefon","Tablet","Bluetooth Hoparlör","Kahve Makinesi"],
    "ev-yasam": ["Pamuklu Nevresim Takımı","Dekoratif Yastık","Buzdolabı","Çamaşır Makinesi","Robot Süpürge","Mutfak Robotu","Halı","Aydınlatma Lambası"],
    kozmetik: ["Nemlendirici Krem","Parfüm 100ml","Ruj Seti","Cilt Bakım Seti","Şampuan & Saç Bakımı","Güneş Kremi","Makyaj Fırça Seti","Erkek Tıraş Seti"],
    "saat-aksesuar": ["Kol Saati","Altın Kolye","Güneş Gözlüğü","Numaralı Gözlük Çerçevesi","Bileklik","Yüzük","Kravat & Mendil Seti","Kemer"],
    supermarket: ["Filtre Kahve 250g","Hediye Kartı 100₺","Türk Kahvesi 250g","Kahve Makinesi Kapsülü","Çikolata Kutusu","Termos","Kahve Değirmeni","Kupa Bardak Seti"]
  };
  const EMOJI_BY_CAT = { kadin:"👗", erkek:"👔", "ayakkabi-canta":"👞", elektronik:"📱", "ev-yasam":"🛋️", kozmetik:"💄", "saat-aksesuar":"⌚", supermarket:"☕" };

  function seedProducts(){
    let pid = 1;
    const products = [];
    SEED.stores.forEach(store => {
      store.categories.forEach(catId => {
        const names = PRODUCT_NAMES[catId] || ["Ürün"];
        const count = 3 + (pid % 2); // 3-4 ürün / mağaza / kategori
        for(let i=0;i<count;i++){
          const name = names[(pid + i) % names.length];
          const price = 300 + ((pid * 37 + i * 53) % 4700);
          const hasDiscount = (pid + i) % 3 === 0;
          const oldPrice = hasDiscount ? Math.round(price * 1.35 / 10) * 10 : null;
          products.push({
            id: "p-" + pid,
            name: name,
            storeId: store.id,
            storeName: store.name,
            category: catId,
            price: price,
            oldPrice: oldPrice,
            emoji: EMOJI_BY_CAT[catId] || "🛍️",
            image: null,
            rating: (3.8 + ((pid*7)%12)/10).toFixed(1),
            reviewCount: 10 + ((pid*13)%450),
            description: `${store.name} güvencesiyle sunulan ${name.toLowerCase()}. Kaliteli malzeme, özenli üretim ve markabahçem küratörlüğüyle seçilmiştir. Kargo ${store.name} tarafından gönderilir.`,
            stock: 5 + (pid % 40),
            createdAt: Date.now() - (pid * 86400000 % (30*86400000))
          });
          pid++;
        }
      });
    });
    return products;
  }

  function loadDB(){
    try{
      const raw = localStorage.getItem(DB_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        // Kendi kendini onarma: SEED'de olup kayıtlı veride eksik olan
        // üst seviye alanları (ör. admin, partners) otomatik tamamlar.
        // Bu, eski/eksik bir localStorage durumunda (ör. önceki bir test
        // sürümünden kalan veri) sitenin kırılmasını engeller.
        const defaults = JSON.parse(JSON.stringify(SEED));
        let healed = false;
        Object.keys(defaults).forEach(key => {
          if(parsed[key] === undefined || parsed[key] === null){ parsed[key] = defaults[key]; healed = true; }
        });
        if(!Array.isArray(parsed.products) || parsed.products.length === 0){
          parsed.products = seedProducts(); healed = true;
        }
        // partners listesine SEED'de olup henüz kayıtlı veride bulunmayan
        // marka hesaplarını (storeId bazlı) otomatik ekler.
        if(Array.isArray(parsed.partners)){
          defaults.partners.forEach(p => {
            if(!parsed.partners.some(existing => existing.storeId === p.storeId)){
              parsed.partners.push(p); healed = true;
            }
          });
        }
        if(healed) saveDB(parsed);
        return parsed;
      }
    }catch(e){ console.warn("markabahçem: DB okunamadı, sıfırlanıyor.", e); }
    const fresh = JSON.parse(JSON.stringify(SEED));
    fresh.products = seedProducts();
    saveDB(fresh);
    return fresh;
  }
  function saveDB(db){
    try{
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }catch(e){
      console.error("markabahçem: localStorage kotası aşıldı olabilir.", e);
    }
  }

  window.resetMarkabahcemDemo = function(){
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem("markabahcem_cart");
    localStorage.removeItem("markabahcem_favorites");
    localStorage.removeItem("markabahcem_auth");
    console.log("markabahçem demo verisi sıfırlandı. Sayfayı yenileyin.");
  };

  function uid(prefix){ return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function json(data, status){
    status = status || 200;
    return Promise.resolve(new Response(JSON.stringify(data), {
      status: status,
      headers: { "Content-Type": "application/json" }
    }));
  }
  function delay(fn){
    return new Promise(resolve => setTimeout(() => resolve(fn()), LATENCY));
  }

  const routes = [];
  function route(method, pattern, handler){
    routes.push({ method, regex: new RegExp("^" + pattern.replace(/:[^/]+/g, "([^/]+)") + "$"),
      keys: (pattern.match(/:[^/]+/g)||[]).map(k=>k.slice(1)), handler });
  }

  // ---------------- ROUTES ----------------

  route("GET", "/api/categories", (params, query, body, db) => json(db.categories));

  route("GET", "/api/stores", (params, query, body, db) => {
    let list = db.stores;
    if(query.get("status")) list = list.filter(s => s.status === query.get("status"));
    return json(list);
  });

  route("GET", "/api/stores/:id", (params, query, body, db) => {
    const s = db.stores.find(s => s.id === params.id);
    if(!s) return json({ error: "Mağaza bulunamadı" }, 404);
    return json(s);
  });

  route("GET", "/api/products", (params, query, body, db) => {
    let list = db.products.slice();
    const cat = query.get("category");
    const store = query.get("store");
    const q = (query.get("q")||"").toLowerCase().trim();
    const sort = query.get("sort");
    const limit = query.get("limit");
    if(cat) list = list.filter(p => p.category === cat);
    if(store) list = list.filter(p => p.storeId === store);
    if(q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.storeName.toLowerCase().includes(q));
    if(sort === "price-asc") list.sort((a,b)=>a.price-b.price);
    else if(sort === "price-desc") list.sort((a,b)=>b.price-a.price);
    else if(sort === "new") list.sort((a,b)=>b.createdAt-a.createdAt);
    if(limit) list = list.slice(0, parseInt(limit,10));
    return json(list);
  });

  route("GET", "/api/products/:id", (params, query, body, db) => {
    const p = db.products.find(p => p.id === params.id);
    if(!p) return json({ error: "Ürün bulunamadı" }, 404);
    return json(p);
  });

  route("GET", "/api/banners", (params, query, body, db) => json(db.banners));

  route("GET", "/api/site-settings", (params, query, body, db) => json(db.siteSettings));

  route("PUT", "/api/site-settings", (params, query, body, db) => {
    db.siteSettings = { ...db.siteSettings, ...body, updatedAt: Date.now() };
    saveDB(db);
    return json(db.siteSettings);
  });

  route("PUT", "/api/banners", (params, query, body, db) => {
    db.banners = body.banners || db.banners;
    saveDB(db);
    return json(db.banners);
  });

  // --- auth (müşteri) ---
  route("POST", "/api/auth/register", (params, query, body, db) => {
    if(db.users.find(u=>u.email===body.email)) return json({ error: "Bu e-posta zaten kayıtlı." }, 400);
    const user = { id: uid("u"), name: body.name, email: body.email, password: body.password };
    db.users.push(user); saveDB(db);
    return json({ id:user.id, name:user.name, email:user.email });
  });
  route("POST", "/api/auth/login", (params, query, body, db) => {
    const u = db.users.find(u=>u.email===body.email && u.password===body.password);
    if(!u) return json({ error: "E-posta veya şifre hatalı." }, 401);
    return json({ id:u.id, name:u.name, email:u.email });
  });

  // --- auth (partner / mağaza) ---
  route("POST", "/api/partner/login", (params, query, body, db) => {
    const p = db.partners.find(p=>p.email===body.email && p.password===body.password);
    if(!p) return json({ error: "E-posta veya şifre hatalı." }, 401);
    const store = db.stores.find(s=>s.id===p.storeId);
    return json({ storeId: p.storeId, storeName: store ? store.name : p.storeId });
  });

  // --- auth (admin) ---
  route("POST", "/api/admin/login", (params, query, body, db) => {
    if(db.admin.email===body.email && db.admin.password===body.password) return json({ ok:true });
    return json({ error: "E-posta veya şifre hatalı." }, 401);
  });

  // --- partner applications ---
  route("POST", "/api/applications", (params, query, body, db) => {
    const app = { id: uid("app"), status: "pending", date: new Date().toISOString().slice(0,10), ...body };
    db.applications.push(app); saveDB(db);
    return json(app, 201);
  });
  route("GET", "/api/applications", (params, query, db2, db) => json(db.applications));
  route("POST", "/api/applications/:id/approve", (params, query, body, db) => {
    const app = db.applications.find(a=>a.id===params.id);
    if(!app) return json({ error:"Başvuru bulunamadı" }, 404);
    app.status = "approved";
    const storeId = (app.brandName||"marka").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || uid("store");
    if(!db.stores.find(s=>s.id===storeId)){
      db.stores.push({ id: storeId, name: app.brandName, emoji:"🏬", logo:null, banner:null,
        desc: app.message || "", commissionRate: 10, status: "active", categories: [app.category].filter(Boolean) });
      db.partners.push({ storeId, email: app.email, password: "123456" });
    }
    saveDB(db);
    return json({ ok:true, storeId });
  });
  route("POST", "/api/applications/:id/reject", (params, query, body, db) => {
    const app = db.applications.find(a=>a.id===params.id);
    if(!app) return json({ error:"Başvuru bulunamadı" }, 404);
    app.status = "rejected"; saveDB(db);
    return json({ ok:true });
  });

  // --- store management (admin) ---
  route("PUT", "/api/stores/:id/status", (params, query, body, db) => {
    const s = db.stores.find(s=>s.id===params.id);
    if(!s) return json({ error:"Mağaza bulunamadı" }, 404);
    s.status = body.status; saveDB(db);
    return json(s);
  });
  route("PUT", "/api/stores/:id/commission", (params, query, body, db) => {
    const s = db.stores.find(s=>s.id===params.id);
    if(!s) return json({ error:"Mağaza bulunamadı" }, 404);
    s.commissionRate = body.commissionRate; saveDB(db);
    return json(s);
  });
  route("PUT", "/api/stores/:id", (params, query, body, db) => {
    const s = db.stores.find(s=>s.id===params.id);
    if(!s) return json({ error:"Mağaza bulunamadı" }, 404);
    Object.assign(s, body); saveDB(db);
    return json(s);
  });

  // --- products CRUD (partner) ---
  route("POST", "/api/products", (params, query, body, db) => {
    const store = db.stores.find(s=>s.id===body.storeId);
    const prod = { id: uid("p"), createdAt: Date.now(), rating:"0.0", reviewCount:0, stock: body.stock||10,
      storeName: store ? store.name : body.storeId, ...body };
    db.products.push(prod); saveDB(db);
    return json(prod, 201);
  });
  route("PUT", "/api/products/:id", (params, query, body, db) => {
    const p = db.products.find(p=>p.id===params.id);
    if(!p) return json({ error:"Ürün bulunamadı" }, 404);
    Object.assign(p, body); saveDB(db);
    return json(p);
  });
  route("DELETE", "/api/products/:id", (params, query, body, db) => {
    const idx = db.products.findIndex(p=>p.id===params.id);
    if(idx===-1) return json({ error:"Ürün bulunamadı" }, 404);
    db.products.splice(idx,1); saveDB(db);
    return json({ ok:true });
  });

  // --- orders ---
  route("POST", "/api/orders", (params, query, body, db) => {
    const order = { id: uid("ord"), date: new Date().toISOString(), status: "preparing", ...body };
    db.orders.push(order); saveDB(db);
    return json(order, 201);
  });
  route("GET", "/api/orders", (params, query, db2, db) => {
    let list = db.orders;
    const storeId = query.get("storeId");
    const userId = query.get("userId");
    if(storeId) list = list.filter(o => (o.storeBreakdown||[]).some(b=>b.storeId===storeId));
    if(userId) list = list.filter(o => o.userId === userId);
    return json(list);
  });
  route("PUT", "/api/orders/:id/status", (params, query, body, db) => {
    const o = db.orders.find(o=>o.id===params.id);
    if(!o) return json({ error:"Sipariş bulunamadı" }, 404);
    o.status = body.status; saveDB(db);
    return json(o);
  });

  // ---------------- fetch override ----------------
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(input, init){
    const url = typeof input === "string" ? input : (input && input.url) || "";
    let path = url, qs = "";
    const qIdx = url.indexOf("?");
    if(qIdx !== -1){ path = url.slice(0, qIdx); qs = url.slice(qIdx+1); }
    if(!path.startsWith("/api/")){
      return originalFetch(input, init);
    }
    const method = ((init && init.method) || "GET").toUpperCase();
    const query = new URLSearchParams(qs);
    let body = {};
    try{ if(init && init.body) body = JSON.parse(init.body); }catch(e){}

    for(const r of routes){
      if(r.method !== method) continue;
      const m = path.match(r.regex);
      if(!m) continue;
      const params = {};
      r.keys.forEach((k,i)=> params[k]=decodeURIComponent(m[i+1]));
      return delay(() => {
        const db = loadDB();
        return r.handler(params, query, body, db);
      });
    }
    return delay(() => json({ error: "Bilinmeyen uç nokta: " + method + " " + path }, 404));
  };

  // İlk yüklemede DB'yi hazırla (varsa dokunma, yoksa seed'le)
  loadDB();
})();
