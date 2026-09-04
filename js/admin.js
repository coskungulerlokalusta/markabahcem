/* admin.js — Platform yönetici paneli mantığı */
let ADM_TAB = "overview";

function renderLoginGate(){
  document.getElementById("panelSidebar").style.display = "none";
  document.getElementById("mobileMenuToggle").style.display = "none";
  document.querySelector(".panel-topbar").style.display = "none";
  document.getElementById("panelContent").innerHTML = `
    <div class="ty-auth-box" style="margin:60px auto">
      <h2>Admin Girişi</h2>
      <p class="sub">markabahçem yönetim paneli</p>
      <form id="adminLoginForm">
        <div class="ty-field"><label>E-posta</label><input type="email" id="aEmail" value="admin@markabahcem.com" required></div>
        <div class="ty-field"><label>Şifre</label><input type="password" id="aPassword" value="admin123" required></div>
        <button class="btn btn-primary btn-block btn-lg" type="submit">Giriş Yap</button>
        <p class="ty-hint" style="text-align:center;margin-top:10px">Demo hesap otomatik dolduruldu.</p>
      </form>
    </div>
  `;
  document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("aEmail").value;
    const password = document.getElementById("aPassword").value;
    const res = await fetch("/api/admin/login", { method:"POST", body: JSON.stringify({ email, password }) });
    if(!res.ok){ showToast("Giriş başarısız."); return; }
    AdminAuth.login();
    location.reload();
  });
}

function switchTab(tab){
  ADM_TAB = tab;
  document.querySelectorAll("#sideNav a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  const titles = { overview:"Genel Bakış", applications:"Başvurular", stores:"Mağazalar", branding:"Site Ayarları" };
  document.getElementById("panelTitle").textContent = titles[tab];
  document.getElementById("panelSidebar").classList.remove("open");
  render();
}

async function render(){
  const wrap = document.getElementById("panelContent");
  if(ADM_TAB === "overview") return renderOverview(wrap);
  if(ADM_TAB === "applications") return renderApplications(wrap);
  if(ADM_TAB === "stores") return renderStores(wrap);
  if(ADM_TAB === "branding") return renderBranding(wrap);
}

async function renderOverview(wrap){
  const [stores, orders, apps] = await Promise.all([
    fetch("/api/stores").then(r=>r.json()),
    fetch("/api/orders").then(r=>r.json()),
    fetch("/api/applications").then(r=>r.json())
  ]);
  const gmv = orders.reduce((sum,o)=>sum+o.total, 0);
  const commissionIncome = orders.reduce((sum,o) => {
    return sum + o.storeBreakdown.reduce((s2,b) => {
      const store = stores.find(s=>s.id===b.storeId);
      const rate = store ? store.commissionRate : 10;
      return s2 + b.subtotal * (rate/100);
    }, 0);
  }, 0);
  const pending = apps.filter(a=>a.status==="pending").length;

  wrap.innerHTML = `
    <div class="panel-cards">
      <div class="panel-stat"><div class="label">Aktif Mağaza</div><div class="value">${stores.filter(s=>s.status==="active").length}</div></div>
      <div class="panel-stat"><div class="label">Toplam Sipariş</div><div class="value">${orders.length}</div></div>
      <div class="panel-stat"><div class="label">Platform Cirosu (GMV)</div><div class="value">${gmv.toLocaleString("tr-TR")} ₺</div></div>
      <div class="panel-stat"><div class="label">Tahmini Komisyon Geliri</div><div class="value">${Math.round(commissionIncome).toLocaleString("tr-TR")} ₺</div></div>
      <div class="panel-stat"><div class="label">Bekleyen Başvuru</div><div class="value">${pending}</div></div>
    </div>
    <div class="panel-block">
      <h3>markabahçem Modeli</h3>
      <p style="font-size:13.5px;color:var(--ty-gray);line-height:1.7">Her sipariş toplam tutarı, ilgili mağazaların ara toplamlarına bölünür. Platform yalnızca komisyonu keser; kalan tutar (gerçek üründe) doğrudan markanın hesabına aktarılır ve kargoyu marka kendisi gönderir. Bu, Farfetch'in kullandığı çok-markalı pazaryeri modeline benzer.</p>
    </div>
  `;
}

async function renderApplications(wrap){
  const apps = await (await fetch("/api/applications")).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Marka Başvuruları</h3>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Marka</th><th>Yetkili</th><th>İletişim</th><th>Kategori</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            ${apps.map(a => {
              const pillClass = a.status==="pending" ? "pill-pending" : a.status==="approved" ? "pill-active" : "pill-rejected";
              const label = a.status==="pending" ? "Bekliyor" : a.status==="approved" ? "Onaylandı" : "Reddedildi";
              return `<tr data-id="${a.id}">
                <td><strong>${a.brandName}</strong></td>
                <td>${a.contactName}</td>
                <td>${a.email}<br><span style="color:var(--ty-gray)">${a.phone}</span></td>
                <td>${a.category}</td>
                <td><span class="pill ${pillClass}">${label}</span></td>
                <td class="icon-btn-row">
                  ${a.status==="pending" ? `<button class="ok apprBtn">Onayla</button><button class="no rejBtn">Reddet</button>` : ""}
                </td>
              </tr>`;
            }).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--ty-gray)">Bekleyen başvuru yok.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
  wrap.querySelectorAll(".apprBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const id = e.target.closest("tr").dataset.id;
    await fetch(`/api/applications/${id}/approve`, { method:"POST" });
    showToast("Başvuru onaylandı, mağaza oluşturuldu.");
    renderApplications(wrap);
  }));
  wrap.querySelectorAll(".rejBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const id = e.target.closest("tr").dataset.id;
    await fetch(`/api/applications/${id}/reject`, { method:"POST" });
    showToast("Başvuru reddedildi.");
    renderApplications(wrap);
  }));
}

async function renderStores(wrap){
  const stores = await (await fetch("/api/stores")).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Mağazalar (${stores.length})</h3>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Mağaza</th><th>Kategori(ler)</th><th>Komisyon</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            ${stores.map(s => `
              <tr data-id="${s.id}">
                <td style="display:flex;align-items:center;gap:8px">${s.emoji} ${s.name}</td>
                <td style="font-size:12px;color:var(--ty-gray)">${s.categories.join(", ")}</td>
                <td><input type="number" class="commissionInput" value="${s.commissionRate}" style="width:56px;padding:5px;border:1px solid var(--ty-border);border-radius:5px"> %</td>
                <td><span class="pill ${s.status==='active'?'pill-active':'pill-paused'}">${s.status==='active'?'Aktif':'Durduruldu'}</span></td>
                <td class="icon-btn-row">
                  <button class="manageBtn">Yönet</button>
                  <button class="saveCommBtn">Kaydet</button>
                  ${s.status==='active' ? `<button class="no toggleBtn" data-status="paused">Durdur</button>` : `<button class="ok toggleBtn" data-status="active">Aktive Et</button>`}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
  wrap.querySelectorAll(".manageBtn").forEach(btn => btn.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;
    const store = stores.find(s => s.id === id);
    // Admin, ayrı bir mağaza girişi yapmadan doğrudan o mağazanın panelini
    // yönetebilsin diye partner oturumunu admin adına geçici olarak açar.
    PartnerAuth.setSession({ storeId: id, storeName: store ? store.name : id });
    location.href = "partner-dashboard.html?admin=1";
  }));
  wrap.querySelectorAll(".saveCommBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;
    const rate = parseFloat(row.querySelector(".commissionInput").value);
    await fetch(`/api/stores/${id}/commission`, { method:"PUT", body: JSON.stringify({ commissionRate: rate }) });
    showToast("Komisyon oranı güncellendi.");
  }));
  wrap.querySelectorAll(".toggleBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const id = row.dataset.id;
    const status = e.target.dataset.status;
    await fetch(`/api/stores/${id}/status`, { method:"PUT", body: JSON.stringify({ status }) });
    showToast("Mağaza durumu güncellendi.");
    renderStores(wrap);
  }));
}

async function renderBranding(wrap){
  const settings = await (await fetch("/api/site-settings")).json();
  const banners = await (await fetch("/api/banners")).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Site Logosu</h3>
      <div class="upload-box" id="siteLogoBox">${settings.logo ? `<img class="upload-preview" src="${settings.logo}">` : `<span>📷 Logo yüklemek için tıklayın (header'da 🌿 yerine görünür)</span>`}</div>
      <input type="file" id="siteLogoInput" accept="image/*" style="display:none">
      <button class="btn btn-primary" id="saveLogoBtn" style="margin-top:12px">Logoyu Kaydet</button>
    </div>
    <div class="panel-block">
      <h3>Ana Sayfa Banner'ları</h3>
      ${banners.map((b,i) => `
        <div style="border:1px solid var(--ty-border);border-radius:8px;padding:14px;margin-bottom:10px">
          <div class="ty-field"><label>Başlık</label><input type="text" class="bannerTitle" data-i="${i}" value="${b.title}"></div>
          <div class="ty-field"><label>Alt Yazı</label><input type="text" class="bannerSub" data-i="${i}" value="${b.sub}"></div>
        </div>
      `).join("")}
      <button class="btn btn-primary" id="saveBannersBtn">Banner'ları Kaydet</button>
    </div>
  `;
  let pendingLogo = settings.logo;
  document.getElementById("siteLogoBox").addEventListener("click", () => document.getElementById("siteLogoInput").click());
  document.getElementById("siteLogoInput").addEventListener("change", async (e) => {
    if(!e.target.files[0]) return;
    pendingLogo = await compressImage(e.target.files[0], 240, 0.8);
    document.getElementById("siteLogoBox").innerHTML = `<img class="upload-preview" src="${pendingLogo}">`;
  });
  document.getElementById("saveLogoBtn").addEventListener("click", async () => {
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ logo: pendingLogo }) });
    showToast("Site logosu güncellendi.");
  });
  document.getElementById("saveBannersBtn").addEventListener("click", async () => {
    const newBanners = banners.map((b,i) => ({
      ...b,
      title: wrap.querySelector(`.bannerTitle[data-i="${i}"]`).value,
      sub: wrap.querySelector(`.bannerSub[data-i="${i}"]`).value
    }));
    await fetch("/api/banners", { method:"PUT", body: JSON.stringify({ banners: newBanners }) });
    showToast("Banner içerikleri güncellendi.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if(!AdminAuth.isLoggedIn()){ renderLoginGate(); return; }

  document.querySelectorAll("#sideNav a").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); switchTab(a.dataset.tab);
  }));
  document.getElementById("adminLogoutBtn").addEventListener("click", (e) => {
    e.preventDefault(); AdminAuth.logout(); location.reload();
  });
  const toggle = document.getElementById("mobileMenuToggle");
  if(toggle) toggle.addEventListener("click", () => document.getElementById("panelSidebar").classList.toggle("open"));

  render();
});
