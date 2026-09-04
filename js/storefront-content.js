/* storefront-content.js — index.html'deki dinamik bölümler:
   hero carousel, marka/mağaza ikon şeridi, indirim kategorileri */

let heroIndex = 0, heroTimer = null, heroSlideCount = 0;

async function loadHero(){
  const track = document.getElementById("heroTrack");
  if(!track) return;
  const res = await fetch("/api/banners");
  const banners = await res.json();
  heroSlideCount = banners.length;
  track.innerHTML = banners.map((b,i) => `
    <div class="ty-hero-slide ${i===0?"active":""}" style="background:${b.color || "#f27a1a"}" data-i="${i}">
      <div>
        <h2>${b.title || ""}</h2>
        ${b.sub ? `<p>${b.sub}</p>` : ""}
        <a href="${b.link || "index.html"}" class="btn btn-primary">${b.cta || "İncele"}</a>
      </div>
    </div>
  `).join("") + `
    <button class="ty-hero-arrow prev" aria-label="Önceki">‹</button>
    <button class="ty-hero-arrow next" aria-label="Sonraki">›</button>
    <div class="ty-hero-dots">${banners.map((_,i)=>`<button class="${i===0?"active":""}" data-i="${i}"></button>`).join("")}</div>
  `;
  track.querySelector(".prev").addEventListener("click", () => goHero(heroIndex-1));
  track.querySelector(".next").addEventListener("click", () => goHero(heroIndex+1));
  track.querySelectorAll(".ty-hero-dots button").forEach(btn => btn.addEventListener("click", () => goHero(parseInt(btn.dataset.i,10))));
  heroTimer = setInterval(() => goHero(heroIndex+1), 5000);
}
function goHero(i){
  const track = document.getElementById("heroTrack");
  heroIndex = (i + heroSlideCount) % heroSlideCount;
  track.querySelectorAll(".ty-hero-slide").forEach((el,idx) => el.classList.toggle("active", idx===heroIndex));
  track.querySelectorAll(".ty-hero-dots button").forEach((el,idx) => el.classList.toggle("active", idx===heroIndex));
}

async function loadBrandStrip(){
  const wrap = document.getElementById("brandStrip");
  if(!wrap) return;
  const res = await fetch("/api/stores?status=active");
  const stores = await res.json();
  const params = new URLSearchParams(location.search);
  const activeStore = params.get("store");
  wrap.innerHTML = `
    <a href="index.html" class="ty-brand-pill">
      <div class="circle" style="${!activeStore ? "border-color:var(--ty-orange)" : ""}">🏬</div>
      <span>Tümü</span>
    </a>
  ` + stores.map(s => `
    <a href="index.html?store=${s.id}" class="ty-brand-pill">
      <div class="circle" style="${activeStore===s.id ? "border-color:var(--ty-orange)" : ""}">${productImageTag(s.logo || s.emoji, s.name)}</div>
      <span>${s.name}</span>
    </a>
  `).join("");
}

const DISCOUNT_CARDS = [
  { label: "%50'ye varan", title: "Kadın Modası", color: "#f27a1a", cat: "kadin" },
  { label: "%40'a varan", title: "Erkek Giyim", color: "#24272b", cat: "erkek" },
  { label: "%30'a varan", title: "Elektronik", color: "#1ba672", cat: "elektronik" },
  { label: "%35'e varan", title: "Ayakkabı & Çanta", color: "#c2410c", cat: "ayakkabi-canta" },
  { label: "%25'e varan", title: "Kozmetik", color: "#a3195b", cat: "kozmetik" },
  { label: "%20'ye varan", title: "Ev & Yaşam", color: "#2554c7", cat: "ev-yasam" }
];
function loadDiscountRow(){
  const wrap = document.getElementById("discountRow");
  if(!wrap) return;
  wrap.innerHTML = DISCOUNT_CARDS.map(c => `
    <a class="ty-discount-card" href="category.html?cat=${c.cat}" style="background:${c.color}">
      <small>${c.label}</small>${c.title}
    </a>
  `).join("");
}

function startFlashTimer(){
  const h = document.getElementById("flashH"), m = document.getElementById("flashM"), s = document.getElementById("flashS");
  if(!h) return;
  let total = 8*3600 + 24*60 + 10;
  setInterval(() => {
    total = total > 0 ? total - 1 : 12*3600;
    const hh = String(Math.floor(total/3600)).padStart(2,"0");
    const mm = String(Math.floor((total%3600)/60)).padStart(2,"0");
    const ss = String(total%60).padStart(2,"0");
    h.textContent = hh; m.textContent = mm; s.textContent = ss;
  }, 1000);
}
