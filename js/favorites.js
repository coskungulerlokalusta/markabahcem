/* favorites.js — favorites.html: kullanıcının favorilediği ürünler */
async function loadFavoritesPage(){
  const ids = FavoritesStore.getIds();
  const grid = document.getElementById("productGrid");
  if(ids.length === 0){
    grid.innerHTML = `<div class="ty-page-empty" style="grid-column:1/-1"><div class="big">♡</div><p>Henüz favori ürününüz yok.</p><a href="index.html" class="btn btn-primary">Alışverişe Başla</a></div>`;
    return;
  }
  const all = await (await fetch("/api/products")).json();
  const favProducts = all.filter(p => ids.includes(p.id));
  renderProductGrid(grid, favProducts);
}
document.addEventListener("DOMContentLoaded", loadFavoritesPage);
window.addEventListener("favorites:changed", loadFavoritesPage);
