async function loadSummary() {
  const res = await fetch("/api/admin/summary");
  const data = await res.json();

  document.getElementById("summaryCards").innerHTML = `
    <div class="summary-card">
      <div class="label">Toplam Sipariş</div>
      <div class="value">${data.totalOrders}</div>
    </div>
    <div class="summary-card">
      <div class="label">Toplam İşlem Hacmi</div>
      <div class="value">${data.totalRevenue.toLocaleString("tr-TR")} ₺</div>
    </div>
    <div class="summary-card">
      <div class="label">Kazandığın Komisyon</div>
      <div class="value">${data.totalCommission.toLocaleString("tr-TR")} ₺</div>
    </div>
  `;

  document.getElementById("storeBody").innerHTML = data.byStore
    .map(
      (s) => `
    <tr>
      <td><strong>${s.storeName}</strong></td>
      <td>${s.orderCount}</td>
      <td>${s.grossSales.toLocaleString("tr-TR")} ₺</td>
      <td>${s.commissionEarned.toLocaleString("tr-TR")} ₺</td>
      <td>${s.payoutOwed.toLocaleString("tr-TR")} ₺</td>
    </tr>`
    )
    .join("");
}

const STATUS_LABELS = {
  active: "✅ Aktif",
  pending: "⏳ Onay Bekliyor",
  rejected: "❌ Reddedildi",
  paused: "⏸️ Askıda",
};

async function loadBusinesses() {
  const res = await fetch("/api/admin/stores");
  const stores = await res.json();

  document.getElementById("businessesBody").innerHTML = stores
    .map((s) => {
      const actions = [];
      if (s.status === "pending") {
        actions.push(`<button class="biz-btn approve" onclick="approveStore('${s.id}')">Onayla</button>`);
        actions.push(`<button class="biz-btn reject" onclick="rejectStore('${s.id}')">Reddet</button>`);
      } else if (s.status === "active") {
        actions.push(`<button class="biz-btn pause" onclick="togglePause('${s.id}')">Askıya Al</button>`);
      } else if (s.status === "paused") {
        actions.push(`<button class="biz-btn approve" onclick="togglePause('${s.id}')">Tekrar Aktifleştir</button>`);
      }

      return `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.contactName || "-"}<br /><span style="color:#999;font-size:11px;">${s.contactEmail || "-"}</span></td>
        <td>
          <input class="biz-commission-input" type="number" value="${s.commissionRate}" onchange="updateCommission('${s.id}', this.value)" />%
        </td>
        <td><span class="biz-status ${s.status}">${STATUS_LABELS[s.status] || s.status}</span></td>
        <td>${new Date(s.appliedAt).toLocaleDateString("tr-TR")}</td>
        <td><div class="biz-actions">${actions.join("")}</div></td>
      </tr>`;
    })
    .join("");
}

async function approveStore(id) {
  await fetch(`/api/admin/stores/${id}/approve`, { method: "POST" });
  loadBusinesses();
  loadSummary();
}

async function rejectStore(id) {
  if (!confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
  await fetch(`/api/admin/stores/${id}/reject`, { method: "POST" });
  loadBusinesses();
}

async function togglePause(id) {
  await fetch(`/api/admin/stores/${id}/toggle-pause`, { method: "POST" });
  loadBusinesses();
  loadSummary();
}

async function updateCommission(id, rate) {
  await fetch(`/api/admin/stores/${id}/commission`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rate }),
  });
}

// ============================================================
// LOGO YÖNETİMİ
// ============================================================
async function loadLogoPreview() {
  const res = await fetch("/api/site-settings");
  const settings = await res.json();
  const box = document.getElementById("logoPreviewBox");
  if (settings.logoImage) {
    box.innerHTML = `<img src="${settings.logoImage}" style="width:100%;height:100%;object-fit:contain;" />`;
  } else {
    box.textContent = "🌿";
  }
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Lütfen bir resim dosyası seç (jpg, png, svg vb.)");
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    alert("Dosya çok büyük (max 8MB).");
    return;
  }
  try {
    const compressed = await compressImage(file, 400, 0.8);
    const res = await fetch("/api/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoImage: compressed }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      alert("❌ Kaydedilemedi: " + (data.error || "Bilinmeyen hata"));
      return;
    }
    loadLogoPreview();
    alert("✅ Logo güncellendi. Değişikliği görmek için sitenin diğer sayfalarını yenile.");
  } catch (e) {
    alert("Görsel işlenirken hata oluştu: " + e.message);
  }
}

async function resetLogo() {
  await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logoImage: null }),
  });
  loadLogoPreview();
}

// ============================================================
// BANNER YÖNETİMİ
// ============================================================
const ZONE_LABELS = { hero: "Üst Ana Banner (Hero Carousel)", strip3: "3'lü Kampanya Şeridi", midpage: "Sayfa Ortası Banner" };

async function loadBannerManager() {
  const res = await fetch("/api/banners");
  const banners = await res.json();
  const container = document.getElementById("promoManagerZones");

  const zones = ["hero", "strip3", "midpage"];
  container.innerHTML = zones
    .map((zone) => {
      const zoneBanners = banners.filter((b) => b.zone === zone);
      return `
      <div class="promo-zone-title">${ZONE_LABELS[zone]}</div>
      <button class="promo-add-btn" onclick="addBanner('${zone}')">+ Yeni Banner Ekle</button>
      ${zoneBanners.map((b) => renderBannerCard(b)).join("") || '<p style="color:#999;font-size:12px;">Bu alanda banner yok.</p>'}
      `;
    })
    .join("");
}

function renderBannerCard(b) {
  const bgStyle = b.image ? "" : `background:${b.gradient};`;
  const previewContent = b.image ? `<img src="${b.image}" />` : b.emoji;
  return `
    <div class="promo-card" id="promo-${b.id}">
      <div class="preview" style="${bgStyle}">${previewContent}</div>
      <div class="fields">
        <input type="text" value="${(b.title || "").replace(/"/g, "&quot;")}" placeholder="Başlık" id="bt-${b.id}" />
        <input type="text" value="${(b.subtitle || "").replace(/"/g, "&quot;")}" placeholder="Alt yazı" id="bs-${b.id}" />
        <div class="row">
          <input type="text" value="${b.link || ""}" placeholder="Link (örn. index.html?store=beymen)" id="bl-${b.id}" />
          <input type="text" value="${b.emoji || ""}" placeholder="Emoji (görsel yoksa)" id="be-${b.id}" />
        </div>
        <div class="row">
          <input type="file" accept="image/*" onchange="handleBannerImageUpload(event, '${b.id}')" />
          <input type="text" value="${b.cta || ""}" placeholder="Buton yazısı (sadece hero)" id="bc-${b.id}" />
        </div>
        <div class="actions">
          <button class="biz-btn approve" onclick="saveBanner('${b.id}')">Kaydet</button>
          <button class="biz-btn reject" onclick="deleteBanner('${b.id}')">Sil</button>
        </div>
      </div>
    </div>`;
}

let pendingBannerImages = {};

async function handleBannerImageUpload(event, id) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { alert("Lütfen bir resim dosyası seç."); return; }
  if (file.size > 8 * 1024 * 1024) {
    alert("Dosya çok büyük (max 8MB).");
    return;
  }
  try {
    const compressed = await compressImage(file, 900, 0.72);
    pendingBannerImages[id] = compressed;
    const card = document.getElementById(`promo-${id}`);
    const preview = card.querySelector(".preview");
    preview.style.background = "none";
    preview.innerHTML = `<img src="${compressed}" />`;
  } catch (e) {
    alert("Görsel işlenirken hata oluştu: " + e.message);
  }
}

async function saveBanner(id) {
  const body = {
    title: document.getElementById(`bt-${id}`).value,
    subtitle: document.getElementById(`bs-${id}`).value,
    link: document.getElementById(`bl-${id}`).value,
    emoji: document.getElementById(`be-${id}`).value,
    cta: document.getElementById(`bc-${id}`).value,
  };
  if (pendingBannerImages[id]) {
    body.image = pendingBannerImages[id];
  }
  const res = await fetch(`/api/banners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    alert("❌ Kaydedilemedi: " + (data.error || "Bilinmeyen hata"));
    return;
  }
  delete pendingBannerImages[id];
  alert("✅ Banner güncellendi. Ana sayfada görmek için oraya gidip yenile.");
  loadBannerManager();
}


async function deleteBanner(id) {
  if (!confirm("Bu bannerı silmek istediğinize emin misiniz?")) return;
  await fetch(`/api/banners/${id}`, { method: "DELETE" });
  loadBannerManager();
}

async function addBanner(zone) {
  const defaults = {
    hero: { title: "Yeni Kampanya Başlığı", subtitle: "Kampanya açıklaması buraya", cta: "Keşfet", gradient: "linear-gradient(120deg,#f27a1a,#ff9a4d)", emoji: "🛍️" },
    strip3: { title: "Yeni Kampanya", subtitle: "Kısa açıklama", gradient: "linear-gradient(135deg,#11998e,#38ef7d)", emoji: "🎯" },
    midpage: { title: "Yeni Duyuru", subtitle: "Açıklama buraya", gradient: "linear-gradient(120deg,#134e5e,#71b280)", emoji: "📣" },
  };
  await fetch("/api/banners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zone, link: "#", ...defaults[zone] }),
  });
  loadBannerManager();
}

loadLogoPreview();
loadBannerManager();
loadBusinesses();
loadSummary();
