function updateCartBadge() {
  const cart = CartStore.get();
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cart.reduce((sum, c) => sum + c.quantity, 0);
}

async function loadFavorites() {
  const favIds = FavoritesStore.get();
  const grid = document.getElementById("favGrid");
  const emptyFav = document.getElementById("emptyFav");

  if (favIds.length === 0) {
    grid.innerHTML = "";
    emptyFav.style.display = "block";
    updateCartBadge();
    return;
  }
  emptyFav.style.display = "none";

  const res = await fetch("/api/products");
  const allProducts = await res.json();
  const favProducts = allProducts.filter((p) => favIds.includes(p.id));

  grid.innerHTML = favProducts
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image" style="cursor:pointer;">
          ${m.hasDiscount ? `<div class="ty-badge-discount">%${m.discountPct}</div>` : ""}
          <div class="ty-fav active" onclick="removeFav(event,'${p.id}')">♥</div>
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

function removeFav(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  FavoritesStore.toggle(productId);
  updateFavoriteCountBadge();
  loadFavorites();
}

loadFavorites();
