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
      ${b.image ? `<div class="ty-hero-bg" style="background-image:url('${b.image}')"></div><div class="ty-hero-overlay"></div>` : ""}
      <div class="ty-hero-slide-content">
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
  const [stores, settings] = await Promise.all([
    fetch("/api/stores?status=active").then(r=>r.json()),
    fetch("/api/site-settings").then(r=>r.json())
  ]);
  const headingEl = document.getElementById("brandsHeadingText");
  if(headingEl && settings.brandsHeading) headingEl.textContent = settings.brandsHeading;

  // Instagram mantığı: hikayesi olan markalar öne alınır, en son hikaye
  // paylaşan en başta görünür. Hikayesi olmayan markalar sıralamayı
  // değiştirmeden (isim sırasıyla) arkadan gelir.
  function lastStoryTime(s){
    if(!s.stories || s.stories.length === 0) return null;
    return Math.max(...s.stories.map(st => new Date(st.createdAt).getTime()));
  }
  const withStory = stores.filter(s => s.stories && s.stories.length > 0)
    .sort((a,b) => lastStoryTime(b) - lastStoryTime(a));

  // Instagram mantığı: bu bölüm artık sadece aktif hikayesi olan markaları
  // gösterir. Hiç hikaye yoksa bölümün tamamı gizlenir.
  const section = wrap.closest(".ty-brandstrip");
  if(withStory.length === 0){
    if(section) section.style.display = "none";
    return;
  }
  if(section) section.style.display = "";

  wrap.innerHTML = withStory.map(s => {
    const circleInner = `${productImageTag(s.logo || s.emoji, s.name)}`;
    const circle = `<button type="button" class="circle has-story" data-store-id="${s.id}">${circleInner}</button>`;
    return `<div class="ty-brand-pill">${circle}<a href="index.html?store=${s.id}"><span>${s.name}</span></a></div>`;
  }).join("");

  // Şeritte görünme sırasıyla aynı: bir markanın hikayesi bitince
  // otomatik olarak sıradaki markanın hikayesine geçer.
  const storyGroups = withStory.map(s => ({
    storeName: s.name,
    storeAvatar: s.logo || s.emoji,
    items: s.stories.map(st => ({ image: st.image, link: st.link }))
  }));
  wrap.querySelectorAll(".circle.has-story").forEach(btn => {
    btn.addEventListener("click", () => {
      const startIndex = withStory.findIndex(s => s.id === btn.dataset.storeId);
      openStoryViewer(storyGroups, startIndex === -1 ? 0 : startIndex);
    });
  });
}

async function loadDiscountRow(){
  const wrap = document.getElementById("discountRow");
  if(!wrap) return;
  const settings = await fetch("/api/site-settings").then(r=>r.json());
  const headingEl = document.getElementById("discountHeadingText");
  if(headingEl && settings.discountHeading) headingEl.textContent = settings.discountHeading;
  const cards = (settings.discountCards && settings.discountCards.length) ? settings.discountCards : [];
  wrap.innerHTML = cards.map(c => `
    <a class="ty-discount-card" href="${c.link || "index.html"}" style="background:${c.color || "#f27a1a"}">
      <small>${c.label || ""}</small>${c.title || ""}
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
