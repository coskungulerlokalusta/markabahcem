/* app.js — index.html'in ana mantığı */
document.addEventListener("DOMContentLoaded", async () => {
  loadHero();
  loadBrandStrip();
  loadDiscountRow();
  startFlashTimer();

  const params = new URLSearchParams(location.search);
  const storeId = params.get("store");
  const storeQS = storeId ? "&store=" + storeId : "";

  const settings = await fetch("/api/site-settings").then(r=>r.json());
  const flashHeadingEl = document.getElementById("flashHeadingText");
  if(flashHeadingEl && settings.flashHeading) flashHeadingEl.textContent = settings.flashHeading;
  const flashSloganEl = document.getElementById("flashSloganText");
  if(flashSloganEl && settings.flashSlogan) flashSloganEl.textContent = settings.flashSlogan;

  // Performans: tüm katalogu indirmek yerine (yavaş mobil bağlantılarda
  // çok zaman alır) sadece gösterilecek kadar ürünü sunucudan çekiyoruz.

  // Flaş ürünler: admin'in özellikle seçtiği ürünler varsa onlar gösterilir
  // (sadece o birkaç ürün tek tek çekilir); hiç seçim yapılmadıysa
  // indirimli ürünlerden sunucu tarafında sınırlı bir seçki istenir.
  let flashItems;
  if(settings.flashProductIds && settings.flashProductIds.length > 0){
    const ids = settings.flashProductIds.join(",");
    flashItems = await fetch("/api/products?ids=" + ids).then(r=>r.json());
  }else{
    flashItems = await fetch("/api/products?discounted=true&limit=6" + storeQS).then(r=>r.json());
  }
  renderProductGrid(document.getElementById("flashGrid"), flashItems);

  const gridTitle = document.getElementById("gridTitle");
  if(storeId){
    try{
      const s = await (await fetch("/api/stores/" + storeId)).json();
      if(gridTitle) gridTitle.textContent = s.name + " Ürünleri";
    }catch(e){}
  }
  const generalProducts = await fetch("/api/products?limit=24" + storeQS).then(r=>r.json());
  renderProductGrid(document.getElementById("productGrid"), generalProducts);
});
