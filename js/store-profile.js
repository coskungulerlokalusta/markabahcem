/* store-profile.js — mağaza vitrin sayfası render (logo, banner, ürünler) */
document.addEventListener("DOMContentLoaded", async () => {
  const storeId = new URLSearchParams(location.search).get("store");
  if(!storeId){ location.href = "index.html"; return; }
  const res = await fetch("/api/stores/" + storeId);
  if(!res.ok){
    document.querySelector(".container").innerHTML = `<div class="ty-page-empty"><div class="big">😕</div><p>Mağaza bulunamadı.</p></div>`;
    return;
  }
  const store = await res.json();
  document.title = store.name + " — markabahçem";

  document.getElementById("storeBanner").innerHTML = store.banner
    ? `<img src="${store.banner}" alt="${store.name}">`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;color:#fff">${store.emoji}</div>`;

  document.getElementById("storeHead").innerHTML = `
    <div class="logo">${productImageTag(store.logo || store.emoji, store.name)}</div>
    <h1>${store.name}</h1>
  `;
  document.getElementById("storeDesc").textContent = store.desc;

  const products = await (await fetch("/api/products?store=" + storeId)).json();
  renderProductGrid(document.getElementById("productGrid"), products);
});
