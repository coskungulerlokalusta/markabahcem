/* product.js — product.html: ürün detayı, sepete ekleme */
let CURRENT_PRODUCT = null;
let CURRENT_QTY = 1;

function renderProductLayout(p){
  const isFav = FavoritesStore.isFav(p.id);
  document.getElementById("productLayout").innerHTML = `
    <div class="ty-product-image">${productImageTag(p.image || p.emoji, p.name)}</div>
    <div class="ty-product-info">
      <a href="store-profile.html?store=${p.storeId}" class="store-link">${p.storeName} mağazasından</a>
      <h1>${p.name}</h1>
      <div class="stars">${formatReviewMeta(p)}</div>
      <div class="price">
        ${p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
        ${p.price.toLocaleString("tr-TR")} ₺
      </div>
      <p style="font-size:13px;color:var(--ty-gray)">${p.stock > 0 ? `Stokta ${p.stock} adet — kargo ${p.storeName} tarafından gönderilir.` : "Stokta yok"}</p>
      <div class="ty-qty-select">
        <button id="qtyDec">−</button>
        <span id="qtyVal">1</span>
        <button id="qtyInc">+</button>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary btn-lg" id="addCartBtn" style="flex:1">Sepete Ekle</button>
        <button class="btn btn-outline btn-lg" id="favBtn">${isFav ? "♥ Favorilerde" : "♡ Favorile"}</button>
      </div>
      <div class="ty-product-desc">${p.description}</div>
    </div>
  `;

  document.getElementById("qtyInc").addEventListener("click", () => { CURRENT_QTY++; document.getElementById("qtyVal").textContent = CURRENT_QTY; });
  document.getElementById("qtyDec").addEventListener("click", () => { if(CURRENT_QTY>1){ CURRENT_QTY--; document.getElementById("qtyVal").textContent = CURRENT_QTY; } });
  document.getElementById("addCartBtn").addEventListener("click", () => {
    CartStore.add(p, CURRENT_QTY);
    showToast(p.name + " sepete eklendi.");
    openCart();
  });
  document.getElementById("favBtn").addEventListener("click", (e) => {
    const nowFav = FavoritesStore.toggle(p.id);
    e.target.textContent = nowFav ? "♥ Favorilerde" : "♡ Favorile";
    showToast(nowFav ? "Favorilere eklendi." : "Favorilerden kaldırıldı.");
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = new URLSearchParams(location.search).get("id");
  if(!id){ location.href = "index.html"; return; }
  const res = await fetch("/api/products/" + id);
  if(!res.ok){
    document.getElementById("productLayout").innerHTML = `<div class="ty-page-empty"><div class="big">😕</div><p>Ürün bulunamadı.</p><a href="index.html" class="btn btn-primary">Ana Sayfaya Dön</a></div>`;
    return;
  }
  const p = await res.json();
  CURRENT_PRODUCT = p;
  renderProductLayout(p);

  const cat = await (await fetch("/api/categories")).json().then(cats => cats.find(c=>c.id===p.category));
  if(cat){
    document.getElementById("crumbCat").textContent = cat.name;
    document.getElementById("crumbCat").href = "category.html?cat=" + cat.id;
  }
  document.getElementById("crumbName").textContent = p.name;
  document.title = p.name + " — markabahçem";

  const related = await (await fetch("/api/products?store=" + p.storeId)).json();
  renderProductGrid(document.getElementById("relatedGrid"), related.filter(r=>r.id!==p.id).slice(0,6));
});
