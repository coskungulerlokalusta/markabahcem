/* search.js — search.html: arama sonuçları */
document.addEventListener("DOMContentLoaded", async () => {
  const q = new URLSearchParams(location.search).get("q") || "";
  document.getElementById("searchTitle").textContent = q ? `"${q}" için sonuçlar` : "Arama Sonuçları";
  const products = await (await fetch("/api/products?q=" + encodeURIComponent(q))).json();
  renderProductGrid(document.getElementById("productGrid"), products);
});
