function updateCartBadge() {
  const cart = CartStore.get();
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cart.reduce((sum, c) => sum + c.quantity, 0);
}

async function runSearch() {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();

  document.getElementById("resultsTitle").textContent = q ? `"${q}" için sonuçlar` : "Arama Sonuçları";

  const res = await fetch("/api/products");
  const products = await res.json();

  const qLower = q.toLowerCase();
  const results = q
    ? products.filter(
        (p) => p.name.toLowerCase().includes(qLower) || p.storeName.toLowerCase().includes(qLower)
      )
    : products;

  const grid = document.getElementById("resultsGrid");
  const noResults = document.getElementById("noResults");

  if (results.length === 0) {
    grid.innerHTML = "";
    noResults.style.display = "block";
    updateCartBadge();
    return;
  }
  noResults.style.display = "none";

  grid.innerHTML = results
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image" style="cursor:pointer;">
          ${m.hasDiscount ? `<div class="ty-badge-discount">%${m.discountPct}</div>` : ""}
          <div class="ty-fav ${FavoritesStore.has(p.id) ? "active" : ""}" onclick="toggleFav(event,'${p.id}')">${FavoritesStore.has(p.id) ? "♥" : "♡"}</div>
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
          <button class="ty-add-btn" onclick="CartStore.add('${p.id}',1); updateCartBadge();">Sepete Ekle</button>
        </div>
      </div>`;
    })
    .join("");

  updateCartBadge();
}

function toggleFav(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  FavoritesStore.toggle(productId);
  updateFavoriteCountBadge();
  runSearch();
}

runSearch();
