let currentProduct = null;
let currentQty = 1;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function updateCartBadge() {
  const cart = CartStore.get();
  const count = cart.reduce((sum, c) => sum + c.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

async function loadProduct() {
  const id = getProductIdFromUrl();
  if (!id) {
    document.getElementById("pdMain").innerHTML = "<p>Ürün bulunamadı.</p>";
    return;
  }

  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    document.getElementById("pdMain").innerHTML = "<p>Ürün bulunamadı.</p>";
    return;
  }

  const data = await res.json();
  currentProduct = data.product;
  renderProduct(currentProduct);
  renderOtherProducts(data.otherProducts, currentProduct.storeName);
}

function renderProduct(p) {
  const m = mockMeta(p);
  const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));

  document.getElementById("breadcrumb").innerHTML = `
    <a href="index.html">Ana Sayfa</a> &rsaquo;
    <a href="index.html">${p.storeName}</a> &rsaquo;
    ${p.name}
  `;

  document.getElementById("pdMain").innerHTML = `
    <div class="pd-main">
      <div class="pd-gallery">
        <div class="pd-image-main" id="pdImageMain">
          ${m.hasDiscount ? `<div class="ty-badge-discount" style="font-size:13px;padding:5px 10px;">%${m.discountPct}</div>` : ""}
          ${productImageTag(p.image, p.name)}
        </div>
        <div class="pd-thumbs">
          <div class="pd-thumb active">${productImageTag(p.image, p.name)}</div>
          <div class="pd-thumb">${productImageTag(p.image, p.name)}</div>
          <div class="pd-thumb">${productImageTag(p.image, p.name)}</div>
        </div>
      </div>
      <div class="pd-info">
        <a href="store-profile.html?slug=${p.storeSlug}" class="pd-store-link">${p.storeName} mağazasından</a>
        <h1 class="pd-title">${p.name}</h1>
        <div class="pd-rating-row">
          <span class="ty-stars">${stars}</span>
          <span>${m.rating} · ${m.reviewCount} değerlendirme</span>
        </div>

        <div class="pd-price-block">
          ${m.hasDiscount ? `<span class="pd-price-old">${m.oldPrice.toLocaleString("tr-TR")} ₺</span><span class="pd-discount-tag">%${m.discountPct} indirim</span>` : ""}
          <span class="pd-price-new">${p.price.toLocaleString("tr-TR")} ₺</span>
        </div>

        <div class="pd-delivery-box">
          <span>${m.freeShip ? "🚚 Kargo Bedava" : "🚚 Kargo Ücreti Ödeme Sırasında Hesaplanır"}</span>
          <span>📦 ${p.storeName} tarafından hazırlanıp gönderilir</span>
          <span>↩️ 14 gün içinde ücretsiz iade</span>
        </div>

        <div class="pd-stock-note">${p.stock > 0 ? `✓ Stokta ${p.stock} adet var` : "Stokta yok"}</div>

        <div class="pd-qty-row">
          <div class="pd-qty-selector">
            <button onclick="changeQty(-1)">−</button>
            <span id="qtyDisplay">1</span>
            <button onclick="changeQty(1)">+</button>
          </div>
        </div>

        <div class="pd-actions">
          <button class="pd-add-btn" id="addBtn" ${p.stock === 0 ? "disabled" : ""} onclick="addCurrentToCart()">
            ${p.stock === 0 ? "Tükendi" : "Sepete Ekle"}
          </button>
          <button class="pd-fav-btn" id="pdFavBtn" onclick="togglePdFav()">${FavoritesStore.has(p.id) ? "♥" : "♡"}</button>
        </div>

        <div class="pd-desc">
          <h3>Ürün Açıklaması</h3>
          <p>${p.storeName} güvencesiyle satılan bu ürün, markabahçem.com üzerinden tek ödeme ile satın alınır;
          sipariş onaylandığında ${p.storeName}'e otomatik olarak iletilir ve kargonuz doğrudan ${p.storeName}
          tarafından hazırlanıp gönderilir.</p>
        </div>
      </div>
    </div>
  `;

  currentQty = 1;
  updateCartBadge();
}

function togglePdFav() {
  FavoritesStore.toggle(currentProduct.id);
  updateFavoriteCountBadge();
  const btn = document.getElementById("pdFavBtn");
  btn.textContent = FavoritesStore.has(currentProduct.id) ? "♥" : "♡";
  btn.style.color = FavoritesStore.has(currentProduct.id) ? "var(--ty-red)" : "";
}

function changeQty(delta) {
  currentQty = Math.max(1, Math.min(currentProduct.stock, currentQty + delta));
  document.getElementById("qtyDisplay").textContent = currentQty;
}

function addCurrentToCart() {
  CartStore.add(currentProduct.id, currentQty);
  updateCartBadge();
  showToast(`${currentProduct.name} sepete eklendi (${currentQty} adet)`);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg + " ✓";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderOtherProducts(others, storeName) {
  if (!others || others.length === 0) return;

  document.getElementById("otherTitle").textContent = `${storeName} mağazasından diğer ürünler`;
  document.getElementById("otherSection").style.display = "block";

  document.getElementById("otherGrid").innerHTML = others
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
          <a href="store-profile.html?slug=${p.storeSlug}" class="ty-card-store" style="text-decoration:none;">${p.storeName}</a>
          <a href="product.html?id=${p.id}" class="ty-card-name" style="color:inherit;">${p.name}</a>
          <div class="ty-rating"><span class="ty-stars">${stars}</span> (${m.reviewCount})</div>
          <div class="ty-price-row"><span class="ty-price-new">${p.price.toLocaleString("tr-TR")} ₺</span></div>
          <button class="ty-add-btn" onclick="CartStore.add('${p.id}',1); updateCartBadge(); showToast('${p.name.replace(/'/g, "")} sepete eklendi')">Sepete Ekle</button>
        </div>
      </div>`;
    })
    .join("");
}

loadProduct();
