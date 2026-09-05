const bcrypt = require("bcryptjs");
const Store = require("../models/Store");
const Product = require("../models/Product");
const SiteSettings = require("../models/SiteSettings");

const STORES_SEED = [
  { name: "Beymen", emoji: "🛍️", desc: "Türkiye'nin köklü lüks moda mağazası. Yerli ve yabancı premium markaları bir araya getirir.", commissionRate: 12, categories: ["kadin","erkek","ayakkabi-canta"] },
  { name: "Vakko", emoji: "🧣", desc: "1934'ten beri Türk modasının öncü ismi. İpek ürünleri ve şıklığıyla tanınır.", commissionRate: 12, categories: ["kadin","erkek","ev-yasam"] },
  { name: "Koton", emoji: "👕", desc: "Genç ve dinamik, güncel trendleri uygun fiyatla sunan hazır giyim markası.", commissionRate: 10, categories: ["kadin","erkek"] },
  { name: "Adil Işık", emoji: "🥿", desc: "1950'den beri Türkiye'nin ayakkabı ve çanta konusunda güvenilir adresi.", commissionRate: 11, categories: ["ayakkabi-canta"] },
  { name: "Altınyıldız Classics", emoji: "🧥", desc: "Klasik ve şık erkek giyiminde Türkiye'nin en tanınan markalarından.", commissionRate: 10, categories: ["erkek"] },
  { name: "LC Waikiki", emoji: "🩳", desc: "Aile giyiminde uygun fiyat ve geniş ürün yelpazesiyle öne çıkan marka.", commissionRate: 9, categories: ["kadin","erkek","ev-yasam"] },
  { name: "Arçelik", emoji: "🧊", desc: "Beyaz eşya ve ev elektroniğinde Türkiye'nin lider markası.", commissionRate: 8, categories: ["ev-yasam","elektronik"] },
  { name: "Media Markt", emoji: "💻", desc: "Elektronik ve teknoloji ürünlerinde geniş seçenek sunan mağaza zinciri.", commissionRate: 7, categories: ["elektronik"] },
  { name: "Zara", emoji: "🧵", desc: "Güncel moda trendlerini hızla vitrine taşıyan global hazır giyim markası.", commissionRate: 13, categories: ["kadin","erkek","ayakkabi-canta"] },
  { name: "H&M", emoji: "👖", desc: "Uygun fiyatlı, trend odaklı ve sürdürülebilir moda anlayışıyla bilinir.", commissionRate: 11, categories: ["kadin","erkek"] },
  { name: "Atasay", emoji: "💍", desc: "Türkiye'nin önde gelen mücevher ve altın takı markası.", commissionRate: 9, categories: ["saat-aksesuar"] },
  { name: "Atasun Optik", emoji: "🕶️", desc: "Gözlük ve göz sağlığında Türkiye genelinde geniş şube ağına sahip marka.", commissionRate: 10, categories: ["saat-aksesuar"] },
  { name: "Starbucks", emoji: "☕", desc: "Dünyaca ünlü kahve zinciri — hediye kartı ve kahve ekipmanları.", commissionRate: 6, categories: ["supermarket"] },
  { name: "Kahve Dünyası", emoji: "🫘", desc: "Türk kahvesi geleneğini modern sunumla buluşturan yerli marka.", commissionRate: 6, categories: ["supermarket"] }
];

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

function slugifyEmail(name){
  return name.toLowerCase()
    .replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "@markabahcem.com";
}

/**
 * Veritabanı boşsa (hiç mağaza yoksa) başlangıç verisini oluşturur.
 * Zaten veri varsa dokunmaz — güvenle birden çok kez çağrılabilir.
 * Dönüş değeri: { seeded: boolean, storeCount, productCount, log: string[] }
 */
async function seedDatabase(){
  const log = [];
  const existingCount = await Store.countDocuments();
  if(existingCount > 0){
    return { seeded: false, storeCount: existingCount, productCount: await Product.countDocuments(), log: [`Veritabanında zaten ${existingCount} mağaza var, seed atlandı.`] };
  }

  const passwordHash = await bcrypt.hash("123456", 10);
  const createdStores = [];
  for(const s of STORES_SEED){
    const loginEmail = slugifyEmail(s.name);
    const store = await Store.create({ ...s, loginEmail, loginPasswordHash: passwordHash });
    createdStores.push(store);
    log.push(`${store.name} → giriş: ${loginEmail} / 123456`);
  }

  let pid = 1, totalProducts = 0;
  for(const store of createdStores){
    for(const catId of store.categories){
      const names = PRODUCT_NAMES[catId] || ["Ürün"];
      const count = 3 + (pid % 2);
      for(let i = 0; i < count; i++){
        const name = names[(pid + i) % names.length];
        const price = 300 + ((pid * 37 + i * 53) % 4700);
        const hasDiscount = (pid + i) % 3 === 0;
        const oldPrice = hasDiscount ? Math.round(price * 1.35 / 10) * 10 : null;
        await Product.create({
          name, storeId: store._id, storeName: store.name, category: catId,
          price, oldPrice, emoji: EMOJI_BY_CAT[catId] || "🛍️", image: null,
          rating: (3.8 + ((pid*7)%12)/10).toFixed(1), reviewCount: 10 + ((pid*13)%450),
          description: `${store.name} güvencesiyle sunulan ${name.toLowerCase()}. Kaliteli malzeme, özenli üretim ve markabahçem küratörlüğüyle seçilmiştir. Kargo ${store.name} tarafından gönderilir.`,
          stock: 5 + (pid % 40)
        });
        pid++; totalProducts++;
      }
    }
  }
  log.push(`${totalProducts} ürün oluşturuldu.`);

  await SiteSettings.create({
    singleton: "main",
    siteName: "markabahçem.com",
    brandsHeading: "Markalar",
    banners: [
      { id: "b1", title: "Sonbahar Koleksiyonu %30'a Varan İndirim", sub: "Beymen, Zara ve H&M'de seçili ürünlerde", cta: "Alışverişe Başla", link: "category.html?cat=kadin", color: "#f27a1a" },
      { id: "b2", title: "Elektronikte Kampanya Zamanı", sub: "Media Markt'ta akıllı telefon ve laptoplarda fırsat", cta: "Ürünleri Gör", link: "category.html?cat=elektronik", color: "#24272b" },
      { id: "b3", title: "Sadece Bildiğin Markalar, Karmaşa Yok", sub: "markabahçem'de yalnızca köklü, güvenilir markalar var", cta: "Markaları Keşfet", link: "index.html", color: "#1ba672" }
    ]
  });
  log.push("Site ayarları ve banner'lar oluşturuldu.");

  return { seeded: true, storeCount: createdStores.length, productCount: totalProducts, log };
}

module.exports = { seedDatabase };
