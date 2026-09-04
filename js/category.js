/* category.js — category.html: kategoriye göre listeleme + sol filtre menüsü */
let CAT_STATE = { cat: null, store: null, sort: "" };

async function loadCategoryFilters(){
  const [cats, stores] = await Promise.all([
    fetch("/api/categories").then(r=>r.json()),
    fetch("/api/stores?status=active").then(r=>r.json())
  ]);

  const catList = document.getElementById("catFilterList");
  catList.innerHTML = cats.map(c => `
    <label><input type="radio" name="catFilter" value="${c.id}" ${CAT_STATE.cat===c.id?"checked":""}> ${c.emoji} ${c.name}</label>
  `).join("");
  catList.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => {
    CAT_STATE.cat = inp.value; CAT_STATE.store = null; syncUrl(); refresh();
  }));

  const relevantStores = CAT_STATE.cat ? stores.filter(s => (s.categories||[]).includes(CAT_STATE.cat)) : stores;
  const storeList = document.getElementById("storeFilterList");
  storeList.innerHTML = `<label><input type="radio" name="storeFilter" value="" ${!CAT_STATE.store?"checked":""}> Tüm Mağazalar</label>` +
    relevantStores.map(s => `
    <label><input type="radio" name="storeFilter" value="${s.id}" ${CAT_STATE.store===s.id?"checked":""}> ${s.name}</label>
  `).join("");
  storeList.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => {
    CAT_STATE.store = inp.value || null; syncUrl(); refresh();
  }));

  const cat = cats.find(c => c.id === CAT_STATE.cat);
  document.getElementById("catTitle").textContent = cat ? cat.name : "Tüm Ürünler";
  document.getElementById("crumbCat").textContent = cat ? cat.name : "Tüm Ürünler";
}

function syncUrl(){
  const params = new URLSearchParams();
  if(CAT_STATE.cat) params.set("cat", CAT_STATE.cat);
  if(CAT_STATE.store) params.set("store", CAT_STATE.store);
  history.replaceState(null, "", "category.html" + (params.toString() ? "?"+params.toString() : ""));
}

async function refresh(){
  const params = new URLSearchParams();
  if(CAT_STATE.cat) params.set("category", CAT_STATE.cat);
  if(CAT_STATE.store) params.set("store", CAT_STATE.store);
  if(CAT_STATE.sort) params.set("sort", CAT_STATE.sort);
  const products = await (await fetch("/api/products?" + params.toString())).json();
  renderProductGrid(document.getElementById("productGrid"), products);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  CAT_STATE.cat = params.get("cat");
  CAT_STATE.store = params.get("store");
  document.getElementById("sortSelect").addEventListener("change", (e) => { CAT_STATE.sort = e.target.value; refresh(); });
  loadCategoryFilters().then(refresh);
});
