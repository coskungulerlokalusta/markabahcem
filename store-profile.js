function getSlugFromUrl() {
  return new URLSearchParams(window.location.search).get("slug");
}

let profileProducts = [];

async function loadStoreProfile() {
  const slug = getSlugFromUrl();
  if (!slug) return;

  const res = await fetch(`/api/stores/${slug}/profile`);
  if (!res.ok) {
    document.getElementById("spName").textContent = "Mağaza bulunamadı";
    return;
  }
  const data = await res.json();
  const store = data.store;
  profileProducts = data.products;

  document.getElementById("spCover").style.background = store.bannerImage
    ? `url(${store.bannerImage}) center/cover`
    : store.bannerGradient || "linear-gradient(120deg,#f27a1a,#ff9a4d)";

  document.getElementById("spLogo").innerHTML = store.logoImage
    ? `<img src="${store.logoImage}" />`
    : "🏪";

  document.getElementById("spName").textContent = store.name;

  const avgRating = (4 + (store.name.length % 10) / 10).toFixed(1);
  document.getElementById("spStats").innerHTML = `
    <span>⭐ <strong>${avgRating}</strong> mağaza puanı</span>
    <span>📦 <strong>${profileProducts.length}</strong> ürün</span>
    <span>📅 markabahçem'de <strong>${new Date(store.appliedAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}</strong>'den beri</span>
  `;

  document.getElementById("spDesc").textContent = store.description || `${store.name} hakkında henüz bir açıklama eklenmedi.`;

  const cartCount = CartStore.get().reduce((s, c) => s + c.quantity, 0);
  document.getElementById("cartCount").textContent = cartCount;

  renderStoreProducts();
}

function renderStoreProducts() {
  const grid = document.getElementById("productGrid");
  if (profileProducts.length === 0) {
    grid.innerHTML = `<p style="color:var(--ty-gray);font-size:13px;">Bu mağazada henüz ürün yok.</p>`;
    return;
  }

  grid.innerHTML = profileProducts
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image">
          ${m.hasDiscount ? `<div class="ty-badge-discount">%${m.discountPct}</div>` : ""}
          ${productImageTag(p.image, p.name)}
        </a>
        <div class="ty-card-body">
          <div class="ty-card-store">${p.storeName}</div>
          <a href="product.html?id=${p.id}" class="ty-card-name" style="color:inherit;">${p.name}</a>
          <div class="ty-rating"><span class="ty-stars">${stars}</span> (${m.reviewCount})</div>
          <div class="ty-price-row">
            ${m.hasDiscount ? `<span class="ty-price-old">${m.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
            <span class="ty-price-new">${p.price.toLocaleString("tr-TR")} ₺</span>
          </div>
          <button class="ty-add-btn" onclick="CartStore.add('${p.id}',1); location.reload();">Sepete Ekle</button>
        </div>
      </div>`;
    })
    .join("");
}

loadStoreProfile();
