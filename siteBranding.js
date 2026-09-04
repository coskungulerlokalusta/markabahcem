// Yüklenen görseli otomatik küçültüp sıkıştırır (localStorage alanını korumak için).
// Büyük fotoğraflar (özellikle telefon kameralarından) 3-5MB olabilir; bu boyutta
// birkaç tanesi localStorage'ın toplam kapasitesini (~5-10MB) hemen doldurur ve
// kayıtlar sessizce başarısız olmaya başlar. Bu fonksiyon her görseli maksimum
// 800px genişliğe ve %72 JPEG kalitesine indirger — genelde 1MB'lık bir fotoğraf
// bu şekilde 50-150KB'a iner.
function compressImage(file, maxWidth, quality) {
  maxWidth = maxWidth || 800;
  quality = quality || 0.72;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Görsel okunamadı"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}

// Ürün görseli emoji ise metin olarak, yüklenmiş gerçek fotoğrafsa <img> olarak gösterir.
function productImageTag(image, altText) {
  const isRealImage = image && (image.indexOf("data:") === 0 || image.indexOf("http") === 0);
  if (isRealImage) {
    return `<img src="${image}" alt="${(altText || "").replace(/"/g, "")}" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
  }
  return image || "📦";
}

// Site logosunu (yüklenmişse) header'lardaki .ty-logo alanına basar.
async function applySiteLogo() {
  try {
    const res = await fetch("/api/site-settings");
    const settings = await res.json();
    if (settings.logoImage) {
      document.querySelectorAll(".ty-logo, .logo").forEach((el) => {
        el.innerHTML = `<img src="${settings.logoImage}" alt="${settings.logoText || "markabahçem"}" style="height:34px;object-fit:contain;" />`;
      });
    }
  } catch (e) {
    // sessiz geç — logo ayarı yoksa varsayılan görünür
  }
}

document.addEventListener("DOMContentLoaded", applySiteLogo);
