/* siteBranding.js — görsel sıkıştırma + logo/ürün görseli render yardımcıları */

/**
 * Kullanıcının yüklediği bir görseli (File) canvas ile küçültüp
 * JPEG'e çevirir; localStorage kotasını aşmamak için (büyük foto'lar
 * 1-2MB'tan ~50-150KB'a iner). Base64 data-URI döndürür.
 */
function compressImage(file, maxDim, quality){
  maxDim = maxDim || 480;
  quality = quality || 0.72;
  return new Promise((resolve, reject) => {
    if(!file) return reject(new Error("Dosya yok"));
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if(width > height && width > maxDim){ height = Math.round(height*maxDim/width); width = maxDim; }
        else if(height > maxDim){ width = Math.round(width*maxDim/height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,width,height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Ürün/mağaza görseli için HTML string üretir: gerçek bir görsel
 * (data: URI) varsa <img>, yoksa emoji basar.
 */
function productImageTag(imageOrEmoji, altText, className){
  className = className || "";
  altText = (altText || "").replace(/"/g, "&quot;");
  if(imageOrEmoji && typeof imageOrEmoji === "string" && imageOrEmoji.startsWith("data:")){
    return `<img class="${className}" src="${imageOrEmoji}" alt="${altText}">`;
  }
  return `<span class="emoji-fallback">${imageOrEmoji || "🛍️"}</span>`;
}

/** Admin panelden yapılan özelleştirmeleri (logo, site adı metni, yazı karakteri)
 * her sayfada header'a uygular. Google Fonts'tan yüklenebilen bir font seçildiyse
 * ilgili <link> etiketini sayfaya dinamik olarak ekler. */
const GOOGLE_FONTS = ["Poppins", "Montserrat", "Playfair Display", "Quicksand", "Pacifico"];

function ensureGoogleFontLoaded(fontName){
  if(!GOOGLE_FONTS.includes(fontName)) return;
  const linkId = "gfont-" + fontName.replace(/\s+/g, "-").toLowerCase();
  if(document.getElementById(linkId)) return;
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(fontName).replace(/%20/g, "+") + ":wght@400;700&display=swap";
  document.head.appendChild(link);
}

async function applySiteBranding(){
  try{
    const res = await fetch("/api/site-settings");
    const settings = await res.json();
    if(!settings) return;
    if(settings.fontFamily) ensureGoogleFontLoaded(settings.fontFamily);
    document.querySelectorAll(".ty-logo").forEach(el => {
      if(settings.logo){
        el.querySelectorAll(".leaf, #siteNameText").forEach(n => n.style.display = "none");
        if(!el.querySelector("img.site-logo")){
          const img = document.createElement("img");
          img.src = settings.logo; img.className = "site-logo"; img.alt = "markabahçem";
          el.prepend(img);
        }
      }
      const nameEl = el.querySelector("#siteNameText");
      if(nameEl){
        if(settings.siteName && settings.siteName.trim()){
          nameEl.textContent = settings.siteName; // özel isimde iki renkli ".com" efekti kalkar
        }
        if(settings.fontFamily){
          nameEl.style.fontFamily = `"${settings.fontFamily}", var(--font)`;
        }
      }
    });
  }catch(e){ /* sessizce geç — demo ortamı */ }
}
// Geriye dönük uyumluluk için eski isim
function applySiteLogo(){ return applySiteBranding(); }
