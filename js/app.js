/* app.js — index.html'in ana mantığı */
document.addEventListener("DOMContentLoaded", async () => {
  loadHero();
  loadBrandStrip();
  loadDiscountRow();
  startFlashTimer();

  const params = new URLSearchParams(location.search);
  const storeId = params.get("store");

  const settings = await fetch("/api/site-settings").then(r=>r.json());
  const flashHeadingEl = document.getElementById("flashHeadingText");
  if(flashHeadingEl && settings.flashHeading) flashHeadingEl.textContent = settings.flashHeading;
  const flashSloganEl = document.getElementById("flashSloganText");
  if(flashSloganEl && settings.flashSlogan) flashSloganEl.textContent = settings.flashSlogan;

  // Flaş ürünler: admin'in özellikle seçtiği ürünler varsa onlar gösterilir;
  // hiç seçim yapılmadıysa indirimli ürünlerden otomatik bir seçki yapılır.
  const allRes = await fetch("/api/products" + (storeId ? "?store=" + storeId : ""));
  const all = await allRes.json();
  let flashItems;
  if(settings.flashProductIds && settings.flashProductIds.length > 0){
    flashItems = settings.flashProductIds.map(id => all.find(p => p.id === id)).filter(Boolean);
  }else{
    flashItems = all.filter(p => p.oldPrice).slice(0, 6);
  }
  renderProductGrid(document.getElementById("flashGrid"), flashItems);

  const gridTitle = document.getElementById("gridTitle");
  if(storeId){
    try{
      const s = await (await fetch("/api/stores/" + storeId)).json();
      if(gridTitle) gridTitle.textContent = s.name + " Ürünleri";
    }catch(e){}
  }
  renderProductGrid(document.getElementById("productGrid"), all.slice(0, 24));
});
