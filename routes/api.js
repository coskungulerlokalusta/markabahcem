/**
 * routes/api.js — markabahçem gerçek backend API rotaları.
 *
 * Bu dosya, önceki prototipte js/static-api.js'in tarayıcıda SAHTE olarak
 * ürettiği tüm /api/... uç noktalarını, artık gerçek bir MongoDB veritabanı
 * üzerinden gerçek olarak sağlar. Frontend kodu (category.js, product.js,
 * checkout.js, admin.js, partner-dashboard.js vb.) HİÇBİR DEĞİŞİKLİK
 * GEREKTİRMEDEN aynı /api/... adreslerini çağırmaya devam eder.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Application = require("../models/Application");
const User = require("../models/User");
const SiteSettings = require("../models/SiteSettings");

const router = express.Router();

// Sabit kategori listesi (nadiren değişir, veritabanında tutmaya gerek yok)
const CATEGORIES = [
  { id: "kadin", name: "Kadın", emoji: "👗" },
  { id: "erkek", name: "Erkek", emoji: "👔" },
  { id: "ayakkabi-canta", name: "Ayakkabı & Çanta", emoji: "👜" },
  { id: "elektronik", name: "Elektronik", emoji: "📱" },
  { id: "ev-yasam", name: "Ev & Yaşam", emoji: "🛋️" },
  { id: "kozmetik", name: "Kozmetik & Parfüm", emoji: "💄" },
  { id: "saat-aksesuar", name: "Saat & Aksesuar", emoji: "⌚" },
  { id: "supermarket", name: "Süpermarket & Kafe", emoji: "☕" }
];

async function getOrCreateSettings(){
  let settings = await SiteSettings.findOne({ singleton: "main" });
  if(!settings) settings = await SiteSettings.create({ singleton: "main" });
  return settings;
}

// .lean() sorguları Mongoose belgesi değil düz obje döndürür, bu yüzden
// toJSON transform'ları otomatik uygulanmaz — hız için .lean() kullanılan
// yerlerde aynı dönüşümü burada elle yapıyoruz.
function formatStore(s){
  return { ...s, id: s._id.toString(), _id: undefined, __v: undefined, loginPasswordHash: undefined };
}
function formatProduct(p){
  return { ...p, id: p._id.toString(), storeId: p.storeId.toString(), createdAt: new Date(p.createdAt).getTime(), _id: undefined, __v: undefined };
}

// ---------------- Kategoriler ----------------
router.get("/categories", (req, res) => res.json(CATEGORIES));

// ---------------- Mağazalar ----------------
router.get("/stores", async (req, res) => {
  const filter = {};
  if(req.query.status) filter.status = req.query.status;
  let query = Store.find(filter).sort({ name: 1 }).lean();
  // Performans: logo/banner gibi ağır base64 alanlarına ihtiyaç duymayan
  // çağrılar (footer linkleri, mega menü, kategori filtreleri) bu alanları
  // hiç indirmesin diye "light=true" ile hafif bir sürüm istenebilir.
  if(req.query.light === "true") query = query.select("name status categories");
  const stores = await query.exec();
  res.json(stores.map(formatStore));
});

router.get("/stores/:id", async (req, res) => {
  const store = await Store.findById(req.params.id).lean().catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  res.json(formatStore(store));
});

router.put("/stores/:id", async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  res.json(store);
});

router.put("/stores/:id/status", async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  res.json(store);
});

router.put("/stores/:id/commission", async (req, res) => {
  const store = await Store.findByIdAndUpdate(req.params.id, { commissionRate: req.body.commissionRate }, { new: true }).catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  res.json(store);
});

// --- Mağaza hikayeleri (Instagram-tarzı) ---
router.post("/stores/:id/stories", async (req, res) => {
  const store = await Store.findById(req.params.id).catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  store.stories.push({ image: req.body.image || null, link: req.body.link || "index.html", caption: req.body.caption || "" });
  await store.save();
  res.status(201).json(store);
});

router.delete("/stores/:id/stories/:storyId", async (req, res) => {
  const store = await Store.findById(req.params.id).catch(() => null);
  if(!store) return res.status(404).json({ error: "Mağaza bulunamadı" });
  store.stories = store.stories.filter(s => s._id.toString() !== req.params.storyId);
  await store.save();
  res.json(store);
});

// ---------------- Ürünler ----------------
router.get("/products", async (req, res) => {
  const filter = {};
  if(req.query.category) filter.category = req.query.category;
  if(req.query.store) filter.storeId = req.query.store;
  if(req.query.discounted === "true") filter.oldPrice = { $ne: null };
  if(req.query.ids){
    const idList = req.query.ids.split(",").filter(Boolean);
    filter._id = { $in: idList };
  }
  if(req.query.q){
    const q = req.query.q;
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { storeName: { $regex: q, $options: "i" } }
    ];
  }
  let query = Product.find(filter).lean();
  if(req.query.sort === "price-asc") query = query.sort({ price: 1 });
  else if(req.query.sort === "price-desc") query = query.sort({ price: -1 });
  else if(req.query.sort === "new") query = query.sort({ createdAt: -1 });
  if(req.query.limit) query = query.limit(parseInt(req.query.limit, 10));
  const products = await query.exec();
  res.json(products.map(formatProduct));
});

router.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).lean().catch(() => null);
  if(!product) return res.status(404).json({ error: "Ürün bulunamadı" });
  res.json(formatProduct(product));
});

router.post("/products", async (req, res) => {
  const store = await Store.findById(req.body.storeId).catch(() => null);
  const product = await Product.create({ ...req.body, storeName: store ? store.name : req.body.storeName });
  res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
  if(!product) return res.status(404).json({ error: "Ürün bulunamadı" });
  res.json(product);
});

router.delete("/products/:id", async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params.id).catch(() => null);
  if(!result) return res.status(404).json({ error: "Ürün bulunamadı" });
  res.json({ ok: true });
});

// ---------------- Site ayarları & banner'lar ----------------
router.get("/site-settings", async (req, res) => res.json(await getOrCreateSettings()));

router.put("/site-settings", async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

router.get("/banners", async (req, res) => res.json((await getOrCreateSettings()).banners));

router.put("/banners", async (req, res) => {
  const settings = await getOrCreateSettings();
  settings.banners = req.body.banners || settings.banners;
  await settings.save();
  res.json(settings.banners);
});

// ---------------- Kimlik doğrulama (müşteri) ----------------
router.post("/auth/register", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const exists = await User.findOne({ email });
  if(exists) return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({ name: req.body.name, email, passwordHash });
  res.json(user);
});

router.post("/auth/login", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const user = await User.findOne({ email });
  if(!user) return res.status(401).json({ error: "E-posta veya şifre hatalı." });
  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if(!ok) return res.status(401).json({ error: "E-posta veya şifre hatalı." });
  res.json(user);
});

// ---------------- Kimlik doğrulama (mağaza/partner) ----------------
router.post("/partner/login", async (req, res) => {
  const store = await Store.findOne({ loginEmail: (req.body.email || "").toLowerCase().trim() });
  if(!store) return res.status(401).json({ error: "E-posta veya şifre hatalı." });
  const ok = await bcrypt.compare(req.body.password, store.loginPasswordHash);
  if(!ok) return res.status(401).json({ error: "E-posta veya şifre hatalı." });
  res.json({ storeId: store.id, storeName: store.name });
});

// ---------------- Kimlik doğrulama (admin) ----------------
router.post("/admin/login", async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@markabahcem.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if(req.body.email === adminEmail && req.body.password === adminPassword) return res.json({ ok: true });
  res.status(401).json({ error: "E-posta veya şifre hatalı." });
});

// ---------------- Marka başvuruları ----------------
router.post("/applications", async (req, res) => {
  const app = await Application.create(req.body);
  res.status(201).json(app);
});

router.get("/applications", async (req, res) => res.json(await Application.find().sort({ date: -1 })));

router.post("/applications/:id/approve", async (req, res) => {
  const app = await Application.findById(req.params.id).catch(() => null);
  if(!app) return res.status(404).json({ error: "Başvuru bulunamadı" });
  app.status = "approved";
  await app.save();

  const existing = await Store.findOne({ name: app.brandName });
  let storeId = existing ? existing.id : null;
  if(!existing){
    const passwordHash = await bcrypt.hash("123456", 10);
    const loginEmail = (app.brandName || "marka").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "@markabahcem.com";
    const created = await Store.create({
      name: app.brandName, emoji: "🏬", desc: app.message || "",
      commissionRate: 10, status: "active", categories: [app.category].filter(Boolean),
      loginEmail, loginPasswordHash: passwordHash
    });
    storeId = created.id;
  }
  res.json({ ok: true, storeId });
});

router.post("/applications/:id/reject", async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true }).catch(() => null);
  if(!app) return res.status(404).json({ error: "Başvuru bulunamadı" });
  res.json({ ok: true });
});

// ---------------- Siparişler ----------------
router.post("/orders", async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
});

router.get("/orders", async (req, res) => {
  const filter = {};
  if(req.query.userId) filter.userId = req.query.userId;
  if(req.query.storeId) filter["storeBreakdown.storeId"] = req.query.storeId;
  const orders = await Order.find(filter).sort({ date: -1 }).lean();
  res.json(orders.map(o => ({ ...o, id: o._id.toString(), _id: undefined, __v: undefined })));
});

router.put("/orders/:id/status", async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).catch(() => null);
  if(!order) return res.status(404).json({ error: "Sipariş bulunamadı" });
  res.json(order);
});

router.post("/products/import-from-url", async (req, res) => {
  const url = req.body.url;
  if(!url) return res.status(400).json({ error: "URL gerekli" });
  try{
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; markabahcemBot/1.0)" } });
    const html = await response.text();
    const pick = (regex) => { const m = html.match(regex); return m ? m[1].trim() : null; };
    const title = pick(/<title[^>]*>([^<]*)<\/title>/i);
    const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogDesc = pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const priceMatch = html.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:₺|TL|TRY)/i);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, "").replace(",", ".")) : null;
    res.json({
      name: title ? title.replace(/\s+/g, " ").slice(0, 120) : null,
      image: ogImage || null,
      description: ogDesc || null,
      price
    });
  }catch(err){
    res.status(500).json({ error: "Sayfa alınamadı: " + err.message });
  }
});

module.exports = router;
