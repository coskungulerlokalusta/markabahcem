/* megaMenu.js — "☰ Kategoriler" açılır mega menüsü */
document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("megaMenuBtn");
  const menu = document.getElementById("megaMenu");
  if(!btn || !menu) return;

  try{
    const [catsRes, storesRes] = await Promise.all([fetch("/api/categories"), fetch("/api/stores")]);
    const cats = await catsRes.json();
    const stores = await storesRes.json();

    menu.innerHTML = `<div class="ty-megamenu-inner">` + cats.map(cat => {
      const catStores = stores.filter(s => s.categories.includes(cat.id)).slice(0,6);
      return `
        <div class="ty-megamenu-col">
          <h4>${cat.emoji} ${cat.name}</h4>
          <a href="category.html?cat=${cat.id}">Tüm ${cat.name} Ürünleri</a>
          ${catStores.map(s => `<a href="category.html?cat=${cat.id}&store=${s.id}">${s.name}</a>`).join("")}
        </div>`;
    }).join("") + `</div>`;
  }catch(e){ console.warn("Mega menü yüklenemedi", e); }

  btn.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if(!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove("open");
  });
});
