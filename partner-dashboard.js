function getStoreIdFromUrl() {
  return new URLSearchParams(window.location.search).get("storeId");
}

const storeId = getStoreIdFromUrl();
let currentStore = null;

if (!storeId) {
  window.location.href = "partner-login.html";
}

async function importFromUrl() {
  const url = document.getElementById("importUrlInput").value.trim();
  const statusBox = document.getElementById("importStatus");

  if (!url || !url.startsWith("http")) {
    alert("Lütfen geçerli bir link gir (http:// veya https:// ile başlamalı)");
    return;
  }

  statusBox.style.display = "block";
  statusBox.style.color = "var(--ty-gray)";
  statusBox.textContent = "Sayfa inceleniyor...";

  try {
    // Tarayıcı güvenliği (CORS) nedeniyle başka bir siteye doğrudan istek atılamaz;
    // bu yüzden üçüncü parti bir "proxy" servisi üzerinden sayfa içeriği çekiliyor.
    // Bu servis her zaman erişilebilir olmayabilir, bazı siteler engelleyebilir.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("Sayfaya ulaşılamadı");

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMeta = (prop) => {
      const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
      return el ? el.getAttribute("content") : null;
    };

    const title = getMeta("og:title") || doc.querySelector("title")?.textContent || "";
    const image = getMeta("og:image") || "";
    const priceRaw = getMeta("og:price:amount") || getMeta("product:price:amount") || "";

    if (!title && !image) {
      statusBox.style.color = "#c0392b";
      statusBox.textContent = "Bu siteden otomatik bilgi çekilemedi (site buna izin vermiyor olabilir). Formu elle doldur.";
      openProductModal();
      return;
    }

    statusBox.style.color = "#0d7a4f";
    statusBox.textContent = `Bulundu: "${title || "isim bulunamadı"}"${priceRaw ? ", fiyat: " + priceRaw : " — fiyat otomatik gelmedi, elle gir"}. Formu kontrol edip kaydet.`;

    openProductModal();
    document.getElementById("mName").value = title.trim();
    if (priceRaw) document.getElementById("mPrice").value = parseFloat(priceRaw) || "";
    if (image) {
      document.getElementById("mImage").value = image;
      document.getElementById("mImagePreviewBox").innerHTML = `<img src="${image}" style="width:100%;height:100%;object-fit:cover;" />`;
    }
  } catch (err) {
    statusBox.style.color = "#c0392b";
    statusBox.textContent = "Otomatik çekme başarısız oldu (bu site erişime kapalı olabilir). Formu elle doldurabilirsin.";
    openProductModal();
  }
}

// ---------- SEKME GEÇİŞİ ----------
document.querySelectorAll(".pd2-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".pd2-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".pd2-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

// ---------- MAĞAZA BİLGİSİ + SİPARİŞLER ----------
async function loadStoreAndOrders() {
  const res = await fetch(`/api/stores`);
  // mağaza aktif olmayabilir (paused), o yüzden admin listesinden de bakalım
  let stores = await res.json();
  let store = stores.find((s) => s.id === storeId);

  if (!store) {
    const adminRes = await fetch(`/api/admin/stores`);
    const allStores = await adminRes.json();
    store = allStores.find((s) => s.id === storeId);
  }

  if (!store) {
    document.getElementById("storeName").textContent = "Mağaza bulunamadı";
    return;
  }

  currentStore = store;
  document.getElementById("storeName").textContent = store.name;
  document.getElementById("storeBadge").textContent = `Katılım: ${new Date(store.appliedAt).toLocaleDateString("tr-TR")}`;

  renderSettings(store);

  const ordersRes = await fetch(`/api/stores/${store.slug}/orders`);
  const ordersData = await ordersRes.json();
  renderOrders(ordersData.subOrders || []);

  loadProducts();
}

function renderOrders(subOrders) {
  const tbody = document.getElementById("ordersBody");
  const emptyMsg = document.getElementById("emptyOrdersMsg");

  const totalRevenue = subOrders.reduce((s, o) => s + o.subtotal, 0);
  const totalCommission = subOrders.reduce((s, o) => s + o.commission, 0);
  const totalPayout = subOrders.reduce((s, o) => s + o.payout, 0);

  document.getElementById("orderSummaryCards").innerHTML = `
    <div class="pd2-summary-card"><div class="label">Sipariş Sayısı</div><div class="value">${subOrders.length}</div></div>
    <div class="pd2-summary-card"><div class="label">Toplam Ciro</div><div class="value">${totalRevenue.toLocaleString("tr-TR")} ₺</div></div>
    <div class="pd2-summary-card"><div class="label">Kesilen Komisyon</div><div class="value">${totalCommission.toLocaleString("tr-TR")} ₺</div></div>
    <div class="pd2-summary-card"><div class="label">Net Hesabına Geçen</div><div class="value">${totalPayout.toLocaleString("tr-TR")} ₺</div></div>
  `;

  if (subOrders.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  tbody.innerHTML = subOrders
    .map(
      (so) => `
    <tr>
      <td><strong>${so.subOrderNumber}</strong></td>
      <td>${so.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</td>
      <td>${so.subtotal.toLocaleString("tr-TR")} ₺</td>
      <td>-${so.commission.toLocaleString("tr-TR")} ₺</td>
      <td><strong>${so.payout.toLocaleString("tr-TR")} ₺</strong></td>
      <td><span class="status-badge">${so.status}</span></td>
    </tr>`
    )
    .join("");
}

function renderSettings(store) {
  document.getElementById("settingsName").textContent = store.name;
  document.getElementById("settingsContact").textContent = store.contactName || "-";
  document.getElementById("settingsEmail").textContent = store.contactEmail || "-";
  document.getElementById("settingsCommission").textContent = `%${store.commissionRate}`;
  document.getElementById("settingsSubmerchant").textContent = store.subMerchantKey || "Henüz atanmadı";
  document.getElementById("settingsStatus").textContent =
    store.status === "active" ? "✅ Aktif" : store.status === "paused" ? "⏸️ Askıya Alındı" : store.status;

  // Mağaza profili alanları
  const logoBox = document.getElementById("profileLogoPreview");
  logoBox.innerHTML = store.logoImage ? `<img src="${store.logoImage}" style="width:100%;height:100%;object-fit:cover;" />` : "🏪";

  const bannerBox = document.getElementById("profilePromoPreview");
  bannerBox.style.background = store.bannerImage ? `url(${store.bannerImage}) center/cover` : (store.bannerGradient || "#fafafa");

  document.getElementById("profileDescription").value = store.description || "";
  document.getElementById("viewProfileLink").href = `store-profile.html?slug=${store.slug}`;
}

let pendingProfileLogo = null;
let pendingProfileBanner = null;

async function handleProfileLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Lütfen bir resim dosyası seç."); return; }
  if (file.size > 8 * 1024 * 1024) { alert("Dosya çok büyük (max 8MB)."); return; }
  try {
    const compressed = await compressImage(file, 500, 0.75);
    pendingProfileLogo = compressed;
    document.getElementById("profileLogoPreview").innerHTML = `<img src="${compressed}" style="width:100%;height:100%;object-fit:cover;" />`;
  } catch (e) {
    alert("Görsel işlenirken hata oluştu: " + e.message);
  }
}

async function handleProfileBannerUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Lütfen bir resim dosyası seç."); return; }
  if (file.size > 8 * 1024 * 1024) { alert("Dosya çok büyük (max 8MB)."); return; }
  try {
    const compressed = await compressImage(file, 1000, 0.7);
    pendingProfileBanner = compressed;
    document.getElementById("profilePromoPreview").style.background = `url(${compressed}) center/cover`;
  } catch (e) {
    alert("Görsel işlenirken hata oluştu: " + e.message);
  }
}

async function saveStoreProfile() {
  const body = { description: document.getElementById("profileDescription").value };
  if (pendingProfileLogo) { body.logoImage = pendingProfileLogo; }
  if (pendingProfileBanner) { body.bannerImage = pendingProfileBanner; }

  const res = await fetch(`/api/stores/${storeId}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    alert("❌ Kaydedilemedi: " + (data.error || "Bilinmeyen hata"));
    return;
  }

  pendingProfileLogo = null;
  pendingProfileBanner = null;
  alert("✅ Mağaza profili kaydedildi.");
  loadStoreAndOrders();
}

// ---------- ÜRÜN YÖNETİMİ ----------
async function loadProducts() {
  const res = await fetch(`/api/partner/${storeId}/products`);
  const products = await res.json();

  document.getElementById("productsBody").innerHTML = products
    .map(
      (p) => `
    <tr>
      <td style="width:48px;height:48px;"><div style="width:44px;height:44px;border-radius:6px;overflow:hidden;background:#fafafa;display:flex;align-items:center;justify-content:center;font-size:22px;">${productImageTag(p.image, p.name)}</div></td>
      <td>${p.name}</td>
      <td>${p.price.toLocaleString("tr-TR")} ₺</td>
      <td>${p.stock}</td>
      <td>
        <div class="pd2-product-row-actions">
          <button class="pd2-icon-btn" onclick='openProductModal(${JSON.stringify(p).replace(/'/g, "&apos;")})'>Düzenle</button>
          <button class="pd2-icon-btn danger" onclick="deleteProduct('${p.id}')">Sil</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

let allCategories = [];

async function loadCategories() {
  const res = await fetch("/api/categories");
  allCategories = await res.json();
  const select = document.getElementById("mCategory");
  select.innerHTML = allCategories.map((c) => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join("");
}

function renderSubcategoryOptions(selectedSub) {
  const catId = document.getElementById("mCategory").value;
  const cat = allCategories.find((c) => c.id === catId);
  const subSelect = document.getElementById("mSubcategory");
  if (!cat) {
    subSelect.innerHTML = "";
    return;
  }
  const allItems = cat.groups.flatMap((g) => g.items);
  subSelect.innerHTML = allItems.map((item) => `<option value="${item}" ${item === selectedSub ? "selected" : ""}>${item}</option>`).join("");
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Lütfen bir resim dosyası seç (jpg, png, webp vb.)");
    event.target.value = "";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    alert("Dosya çok büyük (max 8MB). Daha küçük bir dosya seç.");
    event.target.value = "";
    return;
  }
  try {
    const compressed = await compressImage(file, 600, 0.75);
    document.getElementById("mImage").value = compressed;
    document.getElementById("mImagePreviewBox").innerHTML = `<img src="${compressed}" style="width:100%;height:100%;object-fit:cover;" />`;
  } catch (e) {
    alert("Görsel işlenirken hata oluştu: " + e.message);
  }
}

function updateImagePreviewFromText() {
  const val = document.getElementById("mImage").value;
  const box = document.getElementById("mImagePreviewBox");
  if (val && (val.indexOf("data:") === 0 || val.indexOf("http") === 0)) {
    box.innerHTML = `<img src="${val}" style="width:100%;height:100%;object-fit:cover;" />`;
  } else {
    box.textContent = val || "📦";
  }
}

function openProductModal(product) {
  document.getElementById("productModal").classList.add("open");
  document.getElementById("mImageFile").value = "";
  if (product) {
    document.getElementById("modalTitle").textContent = "Ürünü Düzenle";
    document.getElementById("editProductId").value = product.id;
    document.getElementById("mName").value = product.name;
    document.getElementById("mPrice").value = product.price;
    document.getElementById("mStock").value = product.stock;
    document.getElementById("mImage").value = product.image;
    updateImagePreviewFromText();
    document.getElementById("mCategory").value = product.category || (allCategories[0] && allCategories[0].id);
    renderSubcategoryOptions(product.subcategory);
  } else {
    document.getElementById("modalTitle").textContent = "Yeni Ürün Ekle";
    document.getElementById("editProductId").value = "";
    document.getElementById("mName").value = "";
    document.getElementById("mPrice").value = "";
    document.getElementById("mStock").value = "";
    document.getElementById("mImage").value = "📦";
    updateImagePreviewFromText();
    document.getElementById("mCategory").selectedIndex = 0;
    renderSubcategoryOptions();
  }
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

async function saveProduct() {
  const id = document.getElementById("editProductId").value;
  const body = {
    name: document.getElementById("mName").value,
    price: document.getElementById("mPrice").value,
    stock: document.getElementById("mStock").value,
    image: document.getElementById("mImage").value,
    category: document.getElementById("mCategory").value,
    subcategory: document.getElementById("mSubcategory").value,
  };

  if (!body.name || !body.price) {
    alert("Ürün adı ve fiyat zorunlu");
    return;
  }

  let res;
  if (id) {
    res = await fetch(`/api/partner/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    res = await fetch(`/api/partner/${storeId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  const data = await res.json();
  if (!res.ok || data.success === false) {
    alert("❌ Ürün kaydedilemedi: " + (data.error || "Bilinmeyen hata"));
    return;
  }

  closeProductModal();
  loadProducts();
}

async function deleteProduct(id) {
  if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
  await fetch(`/api/partner/products/${id}`, { method: "DELETE" });
  loadProducts();
}

loadStoreAndOrders();
loadCategories();
