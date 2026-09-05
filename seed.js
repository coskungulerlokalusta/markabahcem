/**
 * seed.js — markabahçem MongoDB veritabanını başlangıç verisiyle doldurur.
 * Terminal/SSH erişiminiz varsa bu şekilde çalıştırabilirsiniz: node seed.js
 * SSH erişiminiz yoksa server.js içindeki /kurulum/seed adresini tarayıcıdan
 * ziyaret ederek de aynı işlemi yapabilirsiniz (bkz. README.md).
 */
require("dotenv").config();
const connectDB = require("./config/db");
const { seedDatabase } = require("./utils/seedData");

connectDB().then(async () => {
  const result = await seedDatabase();
  result.log.forEach(line => console.log("  " + line));
  console.log(result.seeded
    ? `\n✅ Seed tamamlandı! Admin girişi: ${process.env.ADMIN_EMAIL || "admin@markabahcem.com"} / ${process.env.ADMIN_PASSWORD || "admin123"}`
    : "\nSeed atlandı (veritabanı zaten dolu).");
  process.exit(0);
}).catch(err => { console.error("Seed hatası:", err); process.exit(1); });
