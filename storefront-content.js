const STORE_QUICK_EMOJI = {
  beymen: "🏬",
  koton: "🛍️",
  adilisik: "👔",
  altinyildiz: "🧥",
  arcelik: "🔌",
  mediamarkt: "📱",
  zara: "👗",
  hm: "👚",
  atasay: "💍",
  atasunoptik: "🕶️",
  starbucks: "☕",
  kahvedunyasi: "☕",
};

let heroSlideIndex = 0;
let heroTimer = null;

async function loadBanners() {
  const [heroRes, stripRes, midRes, storesRes] = await Promise.all([
    fetch("/api/banners?zone=hero"),
    fetch("/api/banners?zone=strip3"),
    fetch("/api/banners?zone=midpage"),
    fetch("/api/stores"),
  ]);

  const heroSlides = await heroRes.json();
  const stripPromos = await stripRes.json();
  const midPromos = await midRes.json();
  const stores = await storesRes.json();

  renderHeroCarousel(heroSlides);
  renderQuickIcons(stores);
  renderFooterStoreLinks(stores);
  renderStrip3(stripPromos);
  renderMidBanner(midPromos[0]);
  renderDiscountTiers();
  renderCategoryDiscounts(stores);
  renderChipRow();
  startFlashTimer();
}

function renderDiscountTiers() {
  const container = document.getElementById("discountTierRow");
  if (!container) return;
  const tiers = [
    { pct: 10, gradient: "linear-gradient(135deg,#f27a1a,#ffb066)" },
    { pct: 20, gradient: "linear-gradient(135deg,#e0690a,#f27a1a)" },
    { pct: 30, gradient: "linear-gradient(135deg,#c31432,#e0690a)" },
    { pct: 50, gradient: "linear-gradient(135deg,#8e0e00,#c31432)" },
  ];
  container.innerHTML = tiers
    .map(
      (t) => `
    <a href="index.html#dealsGrid" class="ty-discount-tier" style="background:${t.gradient};">
      %${t.pct}<span>ve üzeri indirim</span>
    </a>`
    )
    .join("");
}

function renderCategoryDiscounts(stores) {
  const container = document.getElementById("categoryDiscountRow");
  if (!container) return;
  const fakePct = { beymen: 20, koton: 30, adilisik: 15, altinyildiz: 25 };
  container.innerHTML = stores
    .map(
      (s) => `
    <a href="index.html?store=${s.slug}" class="ty-category-discount-card">
      <div class="emoji">${STORE_QUICK_EMOJI[s.slug] || "🏪"}</div>
      <div class="title">${s.name}</div>
      <div class="pct">%${fakePct[s.slug] || 15}'e varan indirim</div>
    </a>`
    )
    .join("");
}

function renderChipRow() {
  const container = document.getElementById("chipRow");
  if (!container) return;
  const chips = ["Tişört", "Pantolon", "Gömlek", "Kaban", "Kemer", "Takım Elbise", "Sweatshirt", "Kargo Bedava Ürünler"];
  container.innerHTML = chips.map((c) => `<a href="index.html" class="ty-chip">${c}</a>`).join("");
}

function startFlashTimer() {
  const el = document.getElementById("flashTimer");
  if (!el) return;
  let totalSeconds = 5 * 3600; // 5 saat
  setInterval(() => {
    totalSeconds = totalSeconds > 0 ? totalSeconds - 1 : 5 * 3600;
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function bannerBgStyle(b) {
  return b.image ? `background-image:url(${b.image});background-size:cover;background-position:center;` : `background:${b.gradient};`;
}

function renderHeroCarousel(slides) {
  const container = document.getElementById("heroCarousel");
  const dotsContainer = document.getElementById("heroDots");

  container.innerHTML = slides
    .map(
      (s, i) => `
    <a href="${s.link}" class="ty-hero-slide ${i === 0 ? "active" : ""}" style="${bannerBgStyle(s)}" data-index="${i}">
      <div class="content">
        <h1>${s.title}</h1>
        <p>${s.subtitle}</p>
        <span class="cta">${s.cta || "Keşfet"}</span>
      </div>
      <div class="big-emoji">${s.image ? "" : s.emoji}</div>
    </a>`
    )
    .join("");

  dotsContainer.innerHTML = slides
    .map((s, i) => `<div class="ty-hero-dot ${i === 0 ? "active" : ""}" onclick="goToHeroSlide(${i})"></div>`)
    .join("");

  heroSlideIndex = 0;
  if (slides.length > 1) {
    heroTimer = setInterval(() => {
      goToHeroSlide((heroSlideIndex + 1) % slides.length);
    }, 4500);
  }
}

function goToHeroSlide(index) {
  heroSlideIndex = index;
  document.querySelectorAll(".ty-hero-slide").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.index) === index);
  });
  document.querySelectorAll(".ty-hero-dot").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
}

function renderFooterStoreLinks(stores) {
  const container = document.getElementById("footerStoreLinks");
  if (!container) return;
  container.innerHTML = stores
    .map((s) => `<a href="index.html?store=${s.slug}">${s.name}</a>`)
    .join("");
}

function renderQuickIcons(stores) {
  const container = document.getElementById("quickIcons");
  const allIcon = `
    <a href="index.html" class="ty-quick-icon">
      <div class="circle">🛍️</div>
      <span class="label">Tümü</span>
    </a>`;

  container.innerHTML =
    allIcon +
    stores
      .map(
        (s) => `
    <a href="index.html?store=${s.slug}" class="ty-quick-icon">
      <div class="circle">${STORE_QUICK_EMOJI[s.slug] || "🏪"}</div>
      <span class="label">${s.name}</span>
    </a>`
      )
      .join("");
}

function renderStrip3(banners) {
  const container = document.getElementById("stripPromos");
  container.innerHTML = banners
    .map(
      (b) => `
    <a href="${b.link}" class="ty-strip-card" style="${bannerBgStyle(b)}">
      <h3>${b.title}</h3>
      <p>${b.subtitle}</p>
      <span class="emoji">${b.image ? "" : b.emoji}</span>
    </a>`
    )
    .join("");
}

function renderMidBanner(banner) {
  if (!banner) return;
  const container = document.getElementById("midPromo");
  container.setAttribute("style", bannerBgStyle(banner));
  container.innerHTML = `
    <div>
      <h2>${banner.title}</h2>
      <p>${banner.subtitle}</p>
    </div>
    <div class="emoji">${banner.image ? "" : banner.emoji}</div>
  `;
}

loadBanners();
