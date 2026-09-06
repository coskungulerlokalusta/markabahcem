const mongoose = require("mongoose");

async function connectDB(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error("HATA: MONGODB_URI ortam değişkeni tanımlı değil. .env dosyasına ya da Hostinger'daki 'Ortam değişkenleri' bölümüne ekleyin.");
    process.exit(1);
  }
  try{
    // serverSelectionTimeoutMS: Atlas'a ulaşılamazsa varsayılan 30 saniye
    // yerine 8 saniyede hata verip denemeyi bıraksın — böylece bir bağlantı
    // sorununda istekler sonsuza kadar "bekliyor" gibi görünmez.
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000
    });
    console.log("markabahçem: MongoDB bağlantısı başarılı.");
  }catch(err){
    console.error("markabahçem: MongoDB bağlantı hatası:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", err => {
    console.error("markabahçem: MongoDB bağlantı hatası (çalışırken):", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("markabahçem: MongoDB bağlantısı koptu, yeniden bağlanmaya çalışılıyor...");
  });
}

module.exports = connectDB;
