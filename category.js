function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { cat: p.get("cat"), sub: p.get("sub") };
}

async function init() {
  const { cat, sub } = getParams();
  const cartCount = CartStore.get().reduce((s, c) => s + c.quantity, 0);
  document.getElementById("cartCount").textContent = cartCount;

  const [categories, products] = await Promise.all([
    fetch("/api/categories").then((r) => r.json()),
    fetch("/api/products").then((r) => r.json()),
  ]);

  const category = categories.find((c) => c.id === cat);
  if (!category) {
    document.getElementById("catTitle").textContent = "Kategori bulunamadı";
    return;
  }

  document.getElementById("catIcon").textContent = category.icon;
  document.getElementById("catTitle").textContent = sub || category.name;
  document.getElementById("breadcrumb").innerHTML = `
    <a href="index.html">Ana Sayfa</a> &rsaquo;
    <a href="category.html?cat=${cat}">${category.name}</a>
    ${sub ? `&rsaquo; ${sub}` : ""}
  `;

  renderSidebar(category, cat, sub);

  const filtered = products.filter((p) => {
    if (p.category !== cat) return false;
    if (sub && p.subcategory !== sub) return false;
    return true;
  });

  document.getElementById("catCount").textContent = `${filtered.length} ürün bulundu`;
  renderProducts(filtered, category);
}

function renderSidebar(category, activeCat, activeSub) {
  const container = document.getElementById("subcategoryList");
  let html = `<a href="category.html?cat=${activeCat}" class="${!activeSub ? "active" : ""}">Tümü</a>`;
  category.groups.forEach((g) => {
    g.items.forEach((item) => {
      const isActive = activeSub === item;
      html += `<a href="category.html?cat=${activeCat}&sub=${encodeURIComponent(item)}" class="${isActive ? "active" : ""}">${item}</a>`;
    });
  });
  container.innerHTML = html;
}

function renderProducts(products, category) {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");

  if (products.length === 0) {
    grid.style.display = "none";
    emptyState.style.display = "block";
    emptyState.innerHTML = `
      <div class="emoji">${category.icon}</div>
      <p>Bu kategoride şu an ürün bulunmuyor — markabahçem büyümeye devam ediyor, yakında burada da ürünler olacak.</p>
      <a href="index.html">&larr; Ana sayfaya dön ve diğer ürünlere göz at</a>
    `;
    return;
  }

  grid.style.display = "grid";
  emptyState.style.display = "none";

  grid.innerHTML = products
    .map((p) => {
      const m = mockMeta(p);
      const stars = "★★★★★".slice(0, Math.round(m.rating)) + "☆☆☆☆☆".slice(0, 5 - Math.round(m.rating));
      return `
      <div class="ty-card">
        <a href="product.html?id=${p.id}" class="ty-card-image">
          ${m.hasDiscount ? `<div class="ty-badge-discount">%${m.discountPct}</div>` : ""}
          ${productImageTag(p.image, p.name)}
        </a>
        <div class="ty-card-body">
          <a href="store-profile.html?slug=${p.storeSlug}" class="ty-card-store" style="text-decoration:none;">${p.storeName}</a>
          <a href="product.html?id=${p.id}" class="ty-card-name" style="color:inherit;">${p.name}</a>
          <div class="ty-rating"><span class="ty-stars">${stars}</span> (${m.reviewCount})</div>
          <div class="ty-price-row">
            ${m.hasDiscount ? `<span class="ty-price-old">${m.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
            <span class="ty-price-new">${p.price.toLocaleString("tr-TR")} ₺</span>
          </div>
          <button class="ty-add-btn" onclick="CartStore.add('${p.id}',1); location.reload();">Sepete Ekle</button>
        </div>
      </div>`;
    })
    .join("");
}

init();
