/**
 * server.js — markabahçem
 *
 * Artık gerçek bir backend: Express + MongoDB (Mongoose). Statik dosyaları
 * (HTML/CSS/JS) servis eder ve /api/... uç noktalarını routes/api.js
 * üzerinden gerçek veritabanı sorgularıyla karşılar.
 *
 * ⚠️ ÖNEMLİ: app.listen(PORT) YETERLİ DEĞİLDİR. Hostinger'ın proxy'si
 * uygulamaya sadece 0.0.0.0 üzerinden dinleniyorsa ulaşabilir; aksi halde
 * "dinliyorum" derken bile 503 Service Unavailable ile sonuçlanan bir
 * crash-loop oluşabilir. Bu yüzden host olarak "0.0.0.0" açıkça belirtilir.
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Base64 görsel verisi içeren istekler için JSON limiti yükseltildi.
app.use(express.json({ limit: "10mb" }));

app.use("/api", apiRoutes);

// Tek seferlik kurulum: veritabanı boşsa başlangıç verisini (mağazalar,
// ürünler, banner'lar) oluşturur. Terminal/SSH erişimi olmayanlar için
// tarayıcıdan bir kez ziyaret edilerek çalıştırılabilir. SEED_KEY ortam
// değişkeniyle korunur — bilmeyen biri bu adresi tetikleyemez.
app.get("/kurulum/seed", async (req, res) => {
  const requiredKey = process.env.SEED_KEY;
  if(requiredKey && req.query.key !== requiredKey){
    return res.status(403).send("Yetkisiz. Doğru ?key=... parametresiyle tekrar deneyin.");
  }
  try{
    const { seedDatabase } = require("./utils/seedData");
    const result = await seedDatabase();
    res.type("text/plain").send(
      (result.seeded ? "✅ Kurulum tamamlandı!\n\n" : "ℹ️ Veritabanı zaten dolu, hiçbir şey değiştirilmedi.\n\n") +
      result.log.join("\n") +
      (result.seeded ? `\n\nAdmin girişi: ${process.env.ADMIN_EMAIL || "admin@markabahcem.com"} / ${process.env.ADMIN_PASSWORD || "admin123"}` : "")
    );
  }catch(err){
    res.status(500).type("text/plain").send("Kurulum hatası: " + err.message);
  }
});

app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

// Basit health-check — hosting platformları için
app.get("/healthz", (req, res) => res.status(200).send("ok"));

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`markabahçem sunucusu çalışıyor: http://0.0.0.0:${PORT}`);
  });
});

