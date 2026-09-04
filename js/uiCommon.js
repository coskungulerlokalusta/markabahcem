/* uiCommon.js — sepet çekmecesi, toast bildirimi ve footer mağaza linkleri.
   Tüm sayfalarda ortak kullanılır (index, category, product, search, ...). */

function showToast(msg){
  const el = document.getElementById("toast");
  if(!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2400);
}

function updateCartBadge(){
  const badge = document.getElementById("cartCount");
  if(badge) badge.textContent = CartStore.count();
}

function renderCartDrawer(){
  const wrap = document.getElementById("cartItemsWrap");
  const foot = document.getElementById("cartFoot");
  if(!wrap || !foot) return;
  const items = CartStore.getItems();
  updateCartBadge();
  if(items.length === 0){
    wrap.innerHTML = `<div class="ty-empty"><div class="big">🛒</div><p>Sepetiniz şu anda boş.</p></div>`;
    foot.innerHTML = `<a href="index.html" class="btn btn-outline btn-block">Alışverişe Devam Et</a>`;
    return;
  }
  wrap.innerHTML = items.map(i => `
    <div class="ty-cart-item" data-id="${i.productId}">
      <div class="thumb">${productImageTag(i.image || i.emoji, i.name)}</div>
      <div class="info">
        <div class="name">${i.name}</div>
        <div class="store">${i.storeName}</div>
        <div class="qty-row">
          <button data-action="dec">−</button>
          <span>${i.qty}</span>
          <button data-action="inc">+</button>
          <button class="remove" data-action="remove" style="margin-left:auto">Kaldır</button>
        </div>
      </div>
      <div style="font-weight:700; font-size:13.5px; white-space:nowrap">${(i.price*i.qty).toLocaleString("tr-TR")} ₺</div>
    </div>
  `).join("");

  wrap.querySelectorAll(".ty-cart-item").forEach(row => {
    const id = row.dataset.id;
    const item = items.find(i => i.productId === id);
    row.querySelector('[data-action="inc"]').addEventListener("click", () => { CartStore.updateQty(id, item.qty+1); });
    row.querySelector('[data-action="dec"]').addEventListener("click", () => { CartStore.updateQty(id, item.qty-1); });
    row.querySelector('[data-action="remove"]').addEventListener("click", () => { CartStore.remove(id); showToast("Ürün sepetten kaldırıldı."); });
  });

  const storeCount = new Set(items.map(i=>i.storeId)).size;
  foot.innerHTML = `
    ${storeCount > 1 ? `<p style="font-size:12px;color:var(--ty-gray);margin-bottom:10px">🛍️ Sepetinizde <strong>${storeCount} farklı mağaza</strong>dan ürün var. Ödeme tek seferde alınır, her mağaza kendi ürününü kargolar.</p>` : ""}
    <div class="total-row"><span>Toplam</span><span>${CartStore.total().toLocaleString("tr-TR")} ₺</span></div>
    <a href="checkout.html" class="btn btn-primary btn-block btn-lg">Sepeti Onayla</a>
  `;
}

function openCart(){
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
  renderCartDrawer();
}
function closeCart(){
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

async function loadFooterStoreLinks(){
  const wrap = document.getElementById("footerStoreLinks");
  if(!wrap) return;
  try{
    const res = await fetch("/api/stores?status=active");
    const stores = await res.json();
    wrap.innerHTML = "<h4>Mağazalar</h4>" + stores.slice(0,8).map(s =>
      `<a href="store-profile.html?store=${s.id}">${s.name}</a>`).join("");
  }catch(e){ /* sessiz geç */ }
}

/* Ürün kartı HTML'i üretir — index, category, search, store-profile, favorites ortak kullanır. */
function productCardHTML(p){
  const isFav = FavoritesStore.isFav(p.id);
  return `
    <div class="ty-card" data-id="${p.id}">
      <a href="product.html?id=${p.id}" class="thumb">${productImageTag(p.image || p.emoji, p.name)}</a>
      <button class="fav ${isFav ? "active" : ""}" data-action="fav" aria-label="Favorilere ekle">${isFav ? "♥" : "♡"}</button>
      ${p.oldPrice ? `<span class="badge">İNDİRİM</span>` : ""}
      <div class="body">
        <div class="store"><a href="store-profile.html?store=${p.storeId}">${p.storeName}</a></div>
        <a href="product.html?id=${p.id}" class="name">${p.name}</a>
        <div class="stars">${formatReviewMeta(p)}</div>
        <div class="price-row">
          ${p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
          <span class="price">${p.price.toLocaleString("tr-TR")} ₺</span>
        </div>
        <button class="addcart" data-action="addcart">Sepete Ekle</button>
      </div>
    </div>
  `;
}

function wireProductGrid(container){
  if(!container || container.dataset.wired) return;
  container.dataset.wired = "1";
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".ty-card");
    if(!card) return;
    const id = card.dataset.id;
    if(e.target.dataset.action === "fav"){
      e.preventDefault();
      const nowFav = FavoritesStore.toggle(id);
      e.target.classList.toggle("active", nowFav);
      e.target.textContent = nowFav ? "♥" : "♡";
      showToast(nowFav ? "Favorilere eklendi." : "Favorilerden kaldırıldı.");
    }
    if(e.target.dataset.action === "addcart"){
      e.preventDefault();
      fetch("/api/products/" + id).then(r=>r.json()).then(p => {
        CartStore.add(p, 1);
        showToast(p.name + " sepete eklendi.");
        openCart();
      });
    }
  });
}

function renderProductGrid(container, products){
  if(!container) return;
  if(products.length === 0){
    container.innerHTML = `<div class="ty-page-empty" style="grid-column:1/-1"><div class="big">🔎</div><p>Bu kriterlere uygun ürün bulunamadı.</p></div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join("");
  wireProductGrid(container);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  loadFooterStoreLinks();
  applySiteLogo();

  const cartOpenBtn = document.getElementById("cartOpenBtn");
  const cartCloseBtn = document.getElementById("cartCloseBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  if(cartOpenBtn) cartOpenBtn.addEventListener("click", e => { e.preventDefault(); openCart(); });
  if(cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if(cartOverlay) cartOverlay.addEventListener("click", closeCart);

  const accountLink = document.getElementById("accountLink");
  if(accountLink && Auth.isLoggedIn()){
    accountLink.innerHTML = `<span class="ico">👤</span>${Auth.getUser().name.split(" ")[0]}`;
  }

  window.addEventListener("cart:changed", renderCartDrawer);
});
