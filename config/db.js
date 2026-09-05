const mongoose = require("mongoose");

async function connectDB(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error("HATA: MONGODB_URI ortam değişkeni tanımlı değil. .env dosyasına ya da Hostinger'daki 'Ortam değişkenleri' bölümüne ekleyin.");
    process.exit(1);
  }
  try{
    await mongoose.connect(uri);
    console.log("markabahçem: MongoDB bağlantısı başarılı.");
  }catch(err){
    console.error("markabahçem: MongoDB bağlantı hatası:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
