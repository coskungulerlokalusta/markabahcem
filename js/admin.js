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
  const titles = { overview:"Genel Bakış", applications:"Başvurular", stores:"Mağazalar", vitrin:"Vitrin Ürünleri", branding:"Site Ayarları" };
  document.getElementById("panelTitle").textContent = titles[tab];
  document.getElementById("panelSidebar").classList.remove("open");
  render();
}

async function render(){
  const wrap = document.getElementById("panelContent");
  if(ADM_TAB === "overview") return renderOverview(wrap);
  if(ADM_TAB === "applications") return renderApplications(wrap);
  if(ADM_TAB === "stores") return renderStores(wrap);
  if(ADM_TAB === "vitrin") return renderVitrin(wrap);
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
                <td style="font-size:12px;color:var(--ty-gray)">${(s.categories||[]).join(", ")}</td>
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

async function renderVitrin(wrap){
  const [products, settings] = await Promise.all([
    fetch("/api/products").then(r=>r.json()),
    fetch("/api/site-settings").then(r=>r.json())
  ]);
  const selectedIds = settings.flashProductIds || [];
  const groups = {};
  products.forEach(p => {
    if(!groups[p.storeName]) groups[p.storeName] = [];
    groups[p.storeName].push(p);
  });

  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Flaş Ürünler Bölümünde Gösterilecek Ürünler</h3>
      <p class="ty-hint" style="margin-bottom:14px">Aşağıdan istediğiniz kadar ürün seçin. Hiç seçim yapmazsanız, sistem otomatik olarak indirimli ürünlerden bir seçki gösterir.</p>
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <button class="btn btn-primary" id="saveVitrinBtn">Seçimi Kaydet</button>
        <span id="vitrinCount" style="align-self:center;font-size:12.5px;color:var(--ty-gray)">${selectedIds.length} ürün seçili</span>
      </div>
      <div class="table-scroll">
        ${Object.keys(groups).map(storeName => `
          <h4 style="font-size:13.5px;margin:16px 0 8px;color:var(--ty-orange-dark)">${storeName}</h4>
          <table class="data-table" style="margin-bottom:10px">
            <tbody>
              ${groups[storeName].map(p => `
                <tr>
                  <td style="width:34px"><input type="checkbox" class="vitrinCheck" value="${p.id}" ${selectedIds.includes(p.id) ? "checked" : ""}></td>
                  <td style="display:flex;align-items:center;gap:8px">${productImageTag(p.image||p.emoji, p.name, "upload-preview")}${p.name}</td>
                  <td>${p.price.toLocaleString("tr-TR")} ₺${p.oldPrice ? ` <span style="color:var(--ty-gray);text-decoration:line-through">${p.oldPrice.toLocaleString("tr-TR")} ₺</span>` : ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `).join("")}
      </div>
    </div>
  `;
  wrap.querySelectorAll(".upload-preview").forEach(img => { img.style.width="30px"; img.style.height="30px"; img.style.borderRadius="6px"; });

  document.getElementById("saveVitrinBtn").addEventListener("click", async () => {
    const flashProductIds = Array.from(wrap.querySelectorAll(".vitrinCheck:checked")).map(c => c.value);
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ flashProductIds }) });
    showToast("Vitrin ürünleri güncellendi.");
    document.getElementById("vitrinCount").textContent = flashProductIds.length + " ürün seçili";
  });
}

async function renderBranding(wrap){
  const settings = await (await fetch("/api/site-settings")).json();
  const banners = await (await fetch("/api/banners")).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Site Adı & Yazı Karakteri</h3>
      <div class="ty-field"><label>Görünen İsim</label><input type="text" id="siteNameInput" value="${settings.siteName || "markabahçem.com"}" placeholder="markabahçem.com"></div>
      <div class="ty-field">
        <label>Yazı Karakteri</label>
        <select id="fontSelect">
          <option value="">Varsayılan (Sistem Yazı Tipi)</option>
          <option value="Poppins">Poppins</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Playfair Display">Playfair Display (Şık/Klasik)</option>
          <option value="Quicksand">Quicksand (Yuvarlak/Modern)</option>
          <option value="Pacifico">Pacifico (El Yazısı)</option>
        </select>
      </div>
      <div id="fontPreview" style="font-size:22px;font-weight:800;margin:10px 0 16px;padding:14px;background:var(--ty-bg);border-radius:8px"></div>
      <button class="btn btn-primary" id="saveNameBtn">İsim & Fontu Kaydet</button>
      <p class="ty-hint">Not: Özel bir isim girildiğinde varsayılan iki renkli "markabahçem.com" görünümü kalkar, tek renkli görünür. Bir logo yüklerseniz (aşağıda) isim/font ayarı header'da görünmez, logo görseli öncelikli olur.</p>
    </div>
    <div class="panel-block">
      <h3>Site Logosu</h3>
      <div class="upload-box" id="siteLogoBox">${settings.logo ? `<img class="upload-preview" src="${settings.logo}">` : `<span>📷 Logo yüklemek için tıklayın (header'da 🌿 yerine görünür)</span>`}</div>
      <input type="file" id="siteLogoInput" accept="image/*" style="display:none">
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-primary" id="saveLogoBtn">Logoyu Kaydet</button>
        ${settings.logo ? `<button class="btn btn-outline" id="removeLogoBtn">Logoyu Kaldır</button>` : ""}
      </div>
      <p class="ty-hint">Önerilen ölçü: en az <strong>200 × 60 piksel</strong>, şeffaf arka planlı (PNG) yatay bir logo header'da en iyi görünür.</p>
    </div>
    <div class="panel-block">
      <h3>"Markalar" Bölümü</h3>
      <div class="ty-field"><label>Bölüm Başlığı</label><input type="text" id="brandsHeadingInput" value="${settings.brandsHeading || "Markalar"}"></div>
      <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:6px">"Tümü" İkonu (opsiyonel görsel)</label>
      <div class="upload-box" id="allBrandsIconBox">${settings.allBrandsIcon ? `<img class="upload-preview" src="${settings.allBrandsIcon}">` : `<span>🏬 Varsayılan ikon kullanılıyor, değiştirmek için tıklayın</span>`}</div>
      <input type="file" id="allBrandsIconInput" accept="image/*" style="display:none">
      <button class="btn btn-primary" id="saveBrandsBtn" style="margin-top:12px">Bu Bölümü Kaydet</button>
    </div>
    <div class="panel-block">
      <h3>"Kategorilerde İndirim" Bölümü</h3>
      <div class="ty-field"><label>Bölüm Başlığı</label><input type="text" id="discountHeadingInput" value="${settings.discountHeading || "Kategorilerde İndirim"}"></div>
      <div id="discountCardList">
        ${(settings.discountCards || []).map((c,i) => renderDiscountCardEditRow(c,i)).join("")}
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn btn-outline" id="addDiscountCardBtn">+ Yeni Kart Ekle</button>
        <button class="btn btn-primary" id="saveDiscountBtn">Bu Bölümü Kaydet</button>
      </div>
    </div>
    <div class="panel-block">
      <h3>"Flaş Ürünler" Bölümü</h3>
      <div class="ty-field"><label>Bölüm Başlığı</label><input type="text" id="flashHeadingInput" value="${settings.flashHeading || "⚡ Flaş Ürünler"}"></div>
      <div class="ty-field"><label>Slogan (başlığın yanında görünür)</label><input type="text" id="flashSloganInput" value="${settings.flashSlogan || "Fırsatlar sona ermeden yakala"}"></div>
      <button class="btn btn-primary" id="saveFlashTextBtn">Bu Bölümü Kaydet</button>
      <p class="ty-hint">Flaş Ürünler bölümünde hangi ürünlerin görüneceğini seçmek için sol menüden <strong>🌟 Vitrin Ürünleri</strong> sekmesine gidin.</p>
    </div>
    <div class="panel-block">
      <h3>Ana Sayfa Banner'ları</h3>
      <div id="bannerList">
        ${banners.map((b,i) => renderBannerEditRow(b,i)).join("")}
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn btn-outline" id="addBannerBtn">+ Yeni Banner Ekle</button>
        <button class="btn btn-primary" id="saveBannersBtn">Banner'ları Kaydet</button>
      </div>
    </div>
  `;

  function renderDiscountCardEditRow(c, i){
    return `
      <div style="border:1px solid var(--ty-border);border-radius:8px;padding:14px;margin-bottom:10px" data-id="${c.id || ("d"+i)}" class="discountRow">
        <div style="display:flex;gap:12px">
          <div class="ty-field" style="flex:1"><label>Etiket (küçük yazı)</label><input type="text" class="discountLabel" value="${c.label || ""}" placeholder="örn. %30'a varan"></div>
          <div class="ty-field" style="flex:1"><label>Başlık</label><input type="text" class="discountTitle" value="${c.title || ""}" placeholder="örn. Kadın Modası"></div>
          <div class="ty-field" style="width:90px"><label>Renk</label><input type="color" class="discountColor" value="${c.color || "#f27a1a"}" style="width:100%;height:38px;padding:2px;border:1px solid var(--ty-border);border-radius:6px"></div>
        </div>
        <div class="ty-field">
          <label>Bağlantı</label>
          <select class="discountLink">
            <option value="category.html?cat=kadin" ${c.link==="category.html?cat=kadin"?"selected":""}>Kadın Kategorisi</option>
            <option value="category.html?cat=erkek" ${c.link==="category.html?cat=erkek"?"selected":""}>Erkek Kategorisi</option>
            <option value="category.html?cat=ayakkabi-canta" ${c.link==="category.html?cat=ayakkabi-canta"?"selected":""}>Ayakkabı & Çanta</option>
            <option value="category.html?cat=elektronik" ${c.link==="category.html?cat=elektronik"?"selected":""}>Elektronik Kategorisi</option>
            <option value="category.html?cat=ev-yasam" ${c.link==="category.html?cat=ev-yasam"?"selected":""}>Ev & Yaşam</option>
            <option value="category.html?cat=kozmetik" ${c.link==="category.html?cat=kozmetik"?"selected":""}>Kozmetik & Parfüm</option>
            <option value="category.html?cat=saat-aksesuar" ${c.link==="category.html?cat=saat-aksesuar"?"selected":""}>Saat & Aksesuar</option>
            <option value="category.html?cat=supermarket" ${c.link==="category.html?cat=supermarket"?"selected":""}>Süpermarket & Kafe</option>
          </select>
        </div>
        <button class="no removeDiscountBtn" style="margin-top:6px;padding:6px 11px;font-size:12px;border-radius:6px;border:1px solid #f5c6bd;background:#fff;color:var(--ty-danger);font-weight:600">Bu Kartı Sil</button>
      </div>
    `;
  }

  function renderBannerEditRow(b, i){
    return `
      <div style="border:1px solid var(--ty-border);border-radius:8px;padding:14px;margin-bottom:10px" data-i="${i}" data-id="${b.id || ("b"+i)}" data-image="${b.image || ""}" class="bannerRow">
        <div style="display:flex;gap:12px">
          <div class="ty-field" style="flex:1"><label>Başlık</label><input type="text" class="bannerTitle" value="${b.title}"></div>
          <div class="ty-field" style="width:110px"><label>Renk (görsel yoksa/altında kullanılır)</label><input type="color" class="bannerColor" value="${b.color || "#f27a1a"}" style="width:100%;height:38px;padding:2px;border:1px solid var(--ty-border);border-radius:6px"></div>
        </div>
        <div class="ty-field">
          <label>Banner Görseli (opsiyonel)</label>
          <div class="upload-box bannerImageBox">${b.image ? `<img class="upload-preview" src="${b.image}" style="width:100%;height:90px;object-fit:cover">` : `<span>🖼️ Görsel yüklemek için tıklayın</span>`}</div>
          <input type="file" class="bannerImageInput" accept="image/*" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:10px">
            <p class="ty-hint" style="margin:0">Önerilen ölçü: <strong>1600 × 500 piksel</strong> (yatay, geniş bir görsel — 16:5 oranında). Farklı ölçü de yüklenebilir ama kenarlardan kırpılabilir.</p>
            <button type="button" class="removeBannerImageBtn" style="padding:5px 10px;font-size:11px;border-radius:6px;border:1px solid var(--ty-border);background:#fff;white-space:nowrap;display:${b.image ? "inline-block" : "none"}">Kaldır</button>
          </div>
        </div>
        <div class="ty-field"><label>Alt Yazı</label><input type="text" class="bannerSub" value="${b.sub || ""}"></div>
        <div style="display:flex;gap:12px">
          <div class="ty-field" style="flex:1"><label>Buton Metni</label><input type="text" class="bannerCta" value="${b.cta || ""}"></div>
          <div class="ty-field" style="flex:1">
            <label>Bağlantı</label>
            <select class="bannerLink">
              <option value="index.html" ${b.link==="index.html"?"selected":""}>Ana Sayfa</option>
              <option value="category.html?cat=kadin" ${b.link==="category.html?cat=kadin"?"selected":""}>Kadın Kategorisi</option>
              <option value="category.html?cat=erkek" ${b.link==="category.html?cat=erkek"?"selected":""}>Erkek Kategorisi</option>
              <option value="category.html?cat=elektronik" ${b.link==="category.html?cat=elektronik"?"selected":""}>Elektronik Kategorisi</option>
              <option value="category.html?cat=ayakkabi-canta" ${b.link==="category.html?cat=ayakkabi-canta"?"selected":""}>Ayakkabı & Çanta</option>
              <option value="category.html?cat=ev-yasam" ${b.link==="category.html?cat=ev-yasam"?"selected":""}>Ev & Yaşam</option>
              <option value="category.html?cat=kozmetik" ${b.link==="category.html?cat=kozmetik"?"selected":""}>Kozmetik & Parfüm</option>
              <option value="category.html?cat=saat-aksesuar" ${b.link==="category.html?cat=saat-aksesuar"?"selected":""}>Saat & Aksesuar</option>
              <option value="category.html?cat=supermarket" ${b.link==="category.html?cat=supermarket"?"selected":""}>Süpermarket & Kafe</option>
            </select>
          </div>
        </div>
        <button class="no removeBannerBtn" style="margin-top:6px;padding:6px 11px;font-size:12px;border-radius:6px;border:1px solid #f5c6bd;background:#fff;color:var(--ty-danger);font-weight:600">Bu Banner'ı Sil</button>
      </div>
    `;
  }

  const nameInput = document.getElementById("siteNameInput");
  const fontSelect = document.getElementById("fontSelect");
  const preview = document.getElementById("fontPreview");
  fontSelect.value = settings.fontFamily || "";
  function updatePreview(){
    preview.textContent = nameInput.value || "markabahçem.com";
    preview.style.fontFamily = fontSelect.value ? `"${fontSelect.value}", var(--font)` : "var(--font)";
    if(fontSelect.value) ensureGoogleFontLoaded(fontSelect.value);
  }
  updatePreview();
  nameInput.addEventListener("input", updatePreview);
  fontSelect.addEventListener("change", updatePreview);
  document.getElementById("saveNameBtn").addEventListener("click", async () => {
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ siteName: nameInput.value.trim(), fontFamily: fontSelect.value }) });
    showToast("Site adı ve yazı karakteri güncellendi.");
  });

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
  const removeBtn = document.getElementById("removeLogoBtn");
  if(removeBtn) removeBtn.addEventListener("click", async () => {
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ logo: null }) });
    showToast("Logo kaldırıldı, isim/font tekrar görünecek.");
    renderBranding(wrap);
  });

  // --- "Markalar" bölümü ---
  let pendingAllBrandsIcon = settings.allBrandsIcon;
  document.getElementById("allBrandsIconBox").addEventListener("click", () => document.getElementById("allBrandsIconInput").click());
  document.getElementById("allBrandsIconInput").addEventListener("change", async (e) => {
    if(!e.target.files[0]) return;
    pendingAllBrandsIcon = await compressImage(e.target.files[0], 200, 0.8);
    document.getElementById("allBrandsIconBox").innerHTML = `<img class="upload-preview" src="${pendingAllBrandsIcon}">`;
  });
  document.getElementById("saveBrandsBtn").addEventListener("click", async () => {
    const brandsHeading = document.getElementById("brandsHeadingInput").value.trim();
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ brandsHeading, allBrandsIcon: pendingAllBrandsIcon }) });
    showToast("\"Markalar\" bölümü güncellendi.");
  });

  // --- "Kategorilerde İndirim" bölümü ---
  wrap.querySelectorAll(".discountRow").forEach(wireDiscountRow);
  function wireDiscountRow(row){
    row.querySelector(".removeDiscountBtn").addEventListener("click", () => {
      if(document.querySelectorAll(".discountRow").length <= 1){ showToast("En az bir kart kalmalı."); return; }
      row.remove();
    });
  }
  document.getElementById("addDiscountCardBtn").addEventListener("click", () => {
    const list = document.getElementById("discountCardList");
    const newCard = { id: "d" + Date.now(), label: "%20'ye varan", title: "Yeni Kategori", color: "#f27a1a", link: "category.html?cat=kadin" };
    const div = document.createElement("div");
    div.innerHTML = renderDiscountCardEditRow(newCard, list.children.length);
    const row = div.firstElementChild;
    list.appendChild(row);
    wireDiscountRow(row);
  });
  document.getElementById("saveDiscountBtn").addEventListener("click", async () => {
    const discountHeading = document.getElementById("discountHeadingInput").value.trim();
    const discountCards = Array.from(document.querySelectorAll(".discountRow")).map(row => ({
      id: row.dataset.id,
      label: row.querySelector(".discountLabel").value,
      title: row.querySelector(".discountTitle").value,
      color: row.querySelector(".discountColor").value,
      link: row.querySelector(".discountLink").value
    }));
    if(discountCards.length === 0){ showToast("En az bir kart olmalı."); return; }
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ discountHeading, discountCards }) });
    showToast("\"Kategorilerde İndirim\" bölümü güncellendi.");
  });

  // --- "Flaş Ürünler" bölümü (metin) ---
  document.getElementById("saveFlashTextBtn").addEventListener("click", async () => {
    const flashHeading = document.getElementById("flashHeadingInput").value.trim();
    const flashSlogan = document.getElementById("flashSloganInput").value.trim();
    await fetch("/api/site-settings", { method:"PUT", body: JSON.stringify({ flashHeading, flashSlogan }) });
    showToast("\"Flaş Ürünler\" bölümü güncellendi.");
  });

  document.getElementById("saveBannersBtn").addEventListener("click", async () => {
    const newBanners = collectBannersFromDOM();
    if(newBanners.length === 0){ showToast("En az bir banner kalmalı."); return; }
    await fetch("/api/banners", { method:"PUT", body: JSON.stringify({ banners: newBanners }) });
    showToast("Banner içerikleri güncellendi.");
  });

  document.getElementById("addBannerBtn").addEventListener("click", () => {
    const list = document.getElementById("bannerList");
    const newBanner = { id: "b" + Date.now(), title: "Yeni Banner Başlığı", sub: "", cta: "İncele", link: "index.html", color: "#f27a1a" };
    const div = document.createElement("div");
    div.innerHTML = renderBannerEditRow(newBanner, list.children.length);
    const row = div.firstElementChild;
    list.appendChild(row);
    wireBannerRow(row);
  });

  wrap.querySelectorAll(".bannerRow").forEach(wireBannerRow);
  function wireBannerRow(row){
    const removeBtn = row.querySelector(".removeBannerBtn");
    removeBtn.addEventListener("click", () => {
      if(document.querySelectorAll(".bannerRow").length <= 1){ showToast("En az bir banner kalmalı."); return; }
      row.remove();
    });
    const imgBox = row.querySelector(".bannerImageBox");
    const imgInput = row.querySelector(".bannerImageInput");
    const removeImgBtn = row.querySelector(".removeBannerImageBtn");
    imgBox.addEventListener("click", () => imgInput.click());
    imgInput.addEventListener("change", async (e) => {
      if(!e.target.files[0]) return;
      const compressed = await compressImage(e.target.files[0], 1600, 0.75);
      row.dataset.image = compressed;
      imgBox.innerHTML = `<img class="upload-preview" src="${compressed}" style="width:100%;height:90px;object-fit:cover">`;
      removeImgBtn.style.display = "inline-block";
    });
    removeImgBtn.addEventListener("click", () => {
      row.dataset.image = "";
      imgBox.innerHTML = `<span>🖼️ Görsel yüklemek için tıklayın</span>`;
      removeImgBtn.style.display = "none";
    });
  }
  function collectBannersFromDOM(){
    return Array.from(document.querySelectorAll(".bannerRow")).map(row => ({
      id: row.dataset.id,
      title: row.querySelector(".bannerTitle").value,
      sub: row.querySelector(".bannerSub").value,
      cta: row.querySelector(".bannerCta").value,
      link: row.querySelector(".bannerLink").value,
      color: row.querySelector(".bannerColor").value,
      image: row.dataset.image || null
    }));
  }
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
