let products = [];
let cart = CartStore.get(); // [{ productId, quantity }]

function getStoreFilterFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("store");
}

async function loadProducts() {
  const res = await fetch("/api/products");
  products = await res.json();

  const storeFilter = getStoreFilterFromUrl();
  if (storeFilter) {
    products = products.filter((p) => p.storeId.endsWith(storeFilter));
    const sectionTitle = document.querySelector(".ty-section-header h2");
    if (sectionTitle && products.length > 0) {
      sectionTitle.textContent = `${products[0].storeName} Ürünleri`;
    }
    document.querySelectorAll(".ty-categories > a").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `index.html?store=${storeFilter}`);
    });
  }

  renderProducts();
  renderDeals();
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = products
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image" style="cursor:pointer;">
          ${m.hasDiscount ? `<div class="ty-badge-discount">%${m.discountPct}</div>` : ""}
          <div class="ty-fav ${FavoritesStore.has(p.id) ? "active" : ""}" onclick="toggleFav(event,'${p.id}')">${FavoritesStore.has(p.id) ? "♥" : "♡"}</div>
          ${productImageTag(p.image, p.name)}
          ${m.freeShip ? `<div class="ty-badge-freeship">Kargo Bedava</div>` : ""}
        </a>
        <div class="ty-card-body">
          <a href="store-profile.html?slug=${p.storeSlug}" class="ty-card-store" style="text-decoration:none;">${p.storeName}</a>
          <a href="product.html?id=${p.id}" class="ty-card-name" style="color:inherit;">${p.name}</a>
          <div class="ty-rating"><span class="ty-stars">${stars}</span> (${m.reviewCount})</div>
          <div class="ty-price-row">
            ${m.hasDiscount ? `<span class="ty-price-old">${m.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
            <span class="ty-price-new">${p.price.toLocaleString("tr-TR")} ₺</span>
          </div>
          <button class="ty-add-btn" ${p.stock === 0 ? "disabled" : ""} onclick="addToCart('${p.id}')">
            ${p.stock === 0 ? "Tükendi" : "Sepete Ekle"}
          </button>
        </div>
      </div>`;
    })
    .join("");
}

function renderDeals() {
  const dealsGrid = document.getElementById("dealsGrid");
  if (!dealsGrid) return;

  const deals = products.filter((p) => mockMeta(p).hasDiscount);

  if (deals.length === 0) {
    dealsGrid.innerHTML = `<p style="color:var(--ty-gray);font-size:13px;">Şu an bu mağazada fırsat ürünü yok.</p>`;
    return;
  }

  dealsGrid.innerHTML = deals
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image">
          <div class="ty-badge-discount">%${m.discountPct}</div>
          ${productImageTag(p.image, p.name)}
        </a>
        <div class="ty-card-body">
          <a href="store-profile.html?slug=${p.storeSlug}" class="ty-card-store" style="text-decoration:none;">${p.storeName}</a>
          <a href="product.html?id=${p.id}" class="ty-card-name" style="color:inherit;">${p.name}</a>
          <div class="ty-social-proof">${(m.favoriteCount / 1000).toFixed(m.favoriteCount >= 1000 ? 1 : 0)}${m.favoriteCount >= 1000 ? "k" : ""} kişi favoriledi!</div>
          ${m.fastDelivery ? `<div class="ty-fast-delivery">⚡ Hızlı Teslimat</div>` : ""}
          <div class="ty-rating"><span class="ty-stars">${stars}</span> (${m.reviewCount})</div>
          <div class="ty-price-row">
            <span class="ty-price-old">${m.oldPrice.toLocaleString("tr-TR")} ₺</span>
            <span class="ty-price-new">${p.price.toLocaleString("tr-TR")} ₺</span>
          </div>
          <button class="ty-add-btn" onclick="addToCart('${p.id}')">Sepete Ekle</button>
        </div>
      </div>`;
    })
    .join("");
}

function toggleFav(event, productId) {
  event.preventDefault();
  event.stopPropagation();
  FavoritesStore.toggle(productId);
  updateFavoriteCountBadge();
  renderProducts();
  renderDeals();
}

function addToCart(productId) {
  cart = CartStore.add(productId, 1);
  renderCart();
  openCart();
}

function removeFromCart(productId) {
  cart = CartStore.remove(productId);
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const badge = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Artık var olmayan ürünlere ait eski/bozuk sepet kayıtlarını temizle
  // (sayfa çökmesin diye) — kullanıcı fark etmeden sepet kendini onarır.
  const validCart = cart.filter((c) => products.some((p) => p.id === c.productId));
  if (validCart.length !== cart.length) {
    cart = validCart;
    CartStore.save(cart);
  }

  if (cart.length === 0) {
    container.innerHTML = `<div class="ty-cart-empty">Sepetiniz boş</div>`;
    badge.textContent = "0";
    totalEl.textContent = "0 ₺";
    checkoutBtn.disabled = true;
    return;
  }

  const storeCount = new Set(
    cart.map((c) => products.find((p) => p.id === c.productId)?.storeId)
  ).size;

  let total = 0;
  let count = 0;
  let itemsHtml = "";

  if (storeCount > 1) {
    itemsHtml += `<div class="ty-multistore-hint">🛍️ Sepetinizde <strong>${storeCount} farklı mağazadan</strong> ürün var. Tek ödeme yapacaksınız, her mağaza kendi kargosunu ayrı gönderecek.</div>`;
  }

  itemsHtml += cart
    .map((c) => {
      const product = products.find((p) => p.id === c.productId);
      if (!product) return "";
      const lineTotal = product.price * c.quantity;
      total += lineTotal;
      count += c.quantity;
      return `
      <div class="ty-drawer-item">
        <div>
          <div class="ty-drawer-item-store">${product.storeName}</div>
          <div>${product.name} × ${c.quantity}</div>
          <div>${lineTotal.toLocaleString("tr-TR")} ₺</div>
        </div>
        <button class="ty-drawer-remove" onclick="removeFromCart('${c.productId}')">✕</button>
      </div>`;
    })
    .join("");

  container.innerHTML = itemsHtml;
  badge.textContent = count;
  totalEl.textContent = `${total.toLocaleString("tr-TR")} ₺`;
  checkoutBtn.disabled = false;
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

function goToCheckout() {
  window.location.href = "checkout.html";
}

document.getElementById("checkoutBtn").addEventListener("click", goToCheckout);
document.getElementById("cartOpenBtn").addEventListener("click", openCart);
document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);

loadProducts();
renderCart();
