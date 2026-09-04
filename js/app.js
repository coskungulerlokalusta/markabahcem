/* app.js — index.html'in ana mantığı */
document.addEventListener("DOMContentLoaded", async () => {
  loadHero();
  loadBrandStrip();
  loadDiscountRow();
  startFlashTimer();

  const params = new URLSearchParams(location.search);
  const storeId = params.get("store");

  // Flaş ürünler: indirimli ürünlerden rastgele bir seçki
  const allRes = await fetch("/api/products" + (storeId ? "?store=" + storeId : ""));
  const all = await allRes.json();
  const discounted = all.filter(p => p.oldPrice);
  renderProductGrid(document.getElementById("flashGrid"), discounted.slice(0, 6));

  const gridTitle = document.getElementById("gridTitle");
  if(storeId){
    try{
      const s = await (await fetch("/api/stores/" + storeId)).json();
      if(gridTitle) gridTitle.textContent = s.name + " Ürünleri";
    }catch(e){}
  }
  renderProductGrid(document.getElementById("productGrid"), all.slice(0, 24));
});
