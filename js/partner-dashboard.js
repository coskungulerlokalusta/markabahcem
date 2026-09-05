/* partner-dashboard.js — Mağaza paneli mantığı */
let PD_STORE = null;
let PD_TAB = "overview";

async function requireSession(){
  const session = PartnerAuth.getSession();
  if(!session){ location.href = "partner-login.html"; return null; }
  const res = await fetch("/api/stores/" + session.storeId);
  if(!res.ok){ PartnerAuth.logout(); location.href = "partner-login.html"; return null; }
  return await res.json();
}

function switchTab(tab){
  PD_TAB = tab;
  document.querySelectorAll("#sideNav a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  document.getElementById("mobileMenuToggle") && document.getElementById("panelSidebar").classList.remove("open");
  const titles = { overview:"Genel Bakış", products:"Ürünlerim", orders:"Siparişler", profile:"Mağaza Profili", settings:"Ayarlar" };
  document.getElementById("panelTitle").textContent = titles[tab];
  render();
}

async function render(){
  const wrap = document.getElementById("panelContent");
  if(PD_TAB === "overview") return renderOverview(wrap);
  if(PD_TAB === "products") return renderProducts(wrap);
  if(PD_TAB === "orders") return renderOrders(wrap);
  if(PD_TAB === "profile") return renderProfile(wrap);
  if(PD_TAB === "settings") return renderSettings(wrap);
}

async function renderOverview(wrap){
  const products = await (await fetch("/api/products?store=" + PD_STORE.id)).json();
  const orders = await (await fetch("/api/orders?storeId=" + PD_STORE.id)).json();
  const revenue = orders.reduce((sum,o) => sum + (o.storeBreakdown.find(b=>b.storeId===PD_STORE.id)?.subtotal || 0), 0);
  wrap.innerHTML = `
    <div class="panel-cards">
      <div class="panel-stat"><div class="label">Toplam Ürün</div><div class="value">${products.length}</div></div>
      <div class="panel-stat"><div class="label">Toplam Sipariş</div><div class="value">${orders.length}</div></div>
      <div class="panel-stat"><div class="label">Ciro (bu mağaza payı)</div><div class="value">${revenue.toLocaleString("tr-TR")} ₺</div></div>
      <div class="panel-stat"><div class="label">Komisyon Oranı</div><div class="value">%${PD_STORE.commissionRate}</div></div>
    </div>
    <div class="panel-block">
      <h3>Hoş geldiniz, ${PD_STORE.name}</h3>
      <p style="font-size:13.5px;color:var(--ty-gray);line-height:1.7">Bu panelden ürünlerinizi yönetebilir, gelen siparişleri görüntüleyebilir ve mağaza profilinizi güncelleyebilirsiniz. Ödemeler gerçek bir sistemde iyzico/PayTR Pazaryeri gibi bir alt-üye-işyeri sağlayıcısı üzerinden doğrudan hesabınıza aktarılır — bu demoda gerçek para hareketi yoktur.</p>
    </div>
  `;
}

async function renderProducts(wrap){
  const products = await (await fetch("/api/products?store=" + PD_STORE.id)).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">Ürünlerim (${products.length})</h3>
        <button class="btn btn-primary" id="newProductBtn">+ Yeni Ürün</button>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Ürün</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th></th></tr></thead>
          <tbody>
            ${products.map(p => `
              <tr data-id="${p.id}">
                <td style="display:flex;align-items:center;gap:8px">${productImageTag(p.image||p.emoji, p.name, "upload-preview")}${p.name}</td>
                <td>${p.category}</td>
                <td>${p.price.toLocaleString("tr-TR")} ₺</td>
                <td>${p.stock}</td>
                <td class="icon-btn-row"><button class="storyBtn">📸 Hikayeye Ekle</button><button class="editP">Düzenle</button><button class="no delP">Sil</button></td>
              </tr>
            `).join("") || `<tr><td colspan="5" style="text-align:center;color:var(--ty-gray)">Henüz ürün eklenmedi.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
    <div class="panel-block" id="productFormBlock" style="display:none"></div>
  `;
  wrap.querySelectorAll(".upload-preview").forEach(img => { img.style.width="34px"; img.style.height="34px"; img.style.borderRadius="6px"; });
  document.getElementById("newProductBtn").addEventListener("click", () => showProductForm(null));
  wrap.querySelectorAll(".editP").forEach(btn => btn.addEventListener("click", (e) => {
    const id = e.target.closest("tr").dataset.id;
    showProductForm(products.find(p=>p.id===id));
  }));
  wrap.querySelectorAll(".delP").forEach(btn => btn.addEventListener("click", async (e) => {
    const id = e.target.closest("tr").dataset.id;
    if(!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    await fetch("/api/products/" + id, { method:"DELETE" });
    showToast("Ürün silindi.");
    renderProducts(wrap);
  }));
  wrap.querySelectorAll(".storyBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const id = e.target.closest("tr").dataset.id;
    const product = products.find(p => p.id === id);
    if(!product) return;
    if(!product.image){
      if(!confirm("Bu ürünün gerçek bir görseli yok (sadece emoji var). Yine de hikayeye eklemek ister misiniz?")) return;
    }
    await fetch(`/api/stores/${PD_STORE.id}/stories`, {
      method: "POST",
      body: JSON.stringify({ image: product.image || null, link: `product.html?id=${product.id}` })
    });
    showToast("Hikayeye eklendi! Ana sayfadaki marka ikonunuzda görünecek.");
  }));
}

function showProductForm(product){
  const block = document.getElementById("productFormBlock");
  block.style.display = "block";
  block.innerHTML = `
    <h3>${product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h3>
    <div class="ty-field"><label>Ürün Adı</label><input type="text" id="fName" value="${product ? product.name : ""}" required></div>
    <div style="display:flex;gap:12px">
      <div class="ty-field" style="flex:1"><label>Fiyat (₺)</label><input type="number" id="fPrice" value="${product ? product.price : ""}" required></div>
      <div class="ty-field" style="flex:1"><label>Stok</label><input type="number" id="fStock" value="${product ? product.stock : 10}" required></div>
    </div>
    <div class="ty-field">
      <label>Kategori</label>
      <select id="fCategory">
        <option value="kadin">Kadın</option><option value="erkek">Erkek</option>
        <option value="ayakkabi-canta">Ayakkabı & Çanta</option><option value="elektronik">Elektronik</option>
        <option value="ev-yasam">Ev & Yaşam</option><option value="kozmetik">Kozmetik & Parfüm</option>
        <option value="saat-aksesuar">Saat & Aksesuar</option><option value="supermarket">Süpermarket & Kafe</option>
      </select>
    </div>
    <div class="ty-field"><label>Açıklama</label><textarea id="fDesc" rows="3">${product ? product.description : ""}</textarea></div>
    <div class="ty-field">
      <label>Ürün Görseli</label>
      <div class="upload-box" id="fImageBox">
        ${product && product.image ? `<img class="upload-preview" src="${product.image}">` : `<span>📷 Görsel yüklemek için tıklayın</span>`}
      </div>
      <input type="file" id="fImageInput" accept="image/*" style="display:none">
    </div>
    <div class="ty-field">
      <label>Bir URL'den ürün bilgisi almayı dene (deneysel)</label>
      <div style="display:flex;gap:8px">
        <input type="url" id="fImportUrl" placeholder="https://...">
        <button class="btn btn-outline" id="fImportBtn" type="button">İçe Aktar</button>
      </div>
      <p class="ty-hint">⚠️ Sunucu üzerinden denenir, çoğu sitede işe yarar ama JavaScript ile yüklenen sayfalarda çalışmayabilir — bulunan bilgileri her zaman kontrol edin.</p>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-outline" id="cancelProductBtn" type="button">İptal</button>
      <button class="btn btn-primary" id="saveProductBtn" type="button">Kaydet</button>
    </div>
  `;
  let pendingImage = product ? product.image : null;
  const category = document.getElementById("fCategory");
  if(product) category.value = product.category;

  document.getElementById("fImageBox").addEventListener("click", () => document.getElementById("fImageInput").click());
  document.getElementById("fImageInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    pendingImage = await compressImage(file, 500, 0.75);
    document.getElementById("fImageBox").innerHTML = `<img class="upload-preview" src="${pendingImage}">`;
  });

  document.getElementById("fImportBtn").addEventListener("click", async () => {
    const url = document.getElementById("fImportUrl").value;
    if(!url) return;
    showToast("Ürün bilgisi alınmaya çalışılıyor...");
    try{
      const res = await fetch("/api/products/import-from-url", { method: "POST", body: JSON.stringify({ url }) });
      const data = await res.json();
      if(!res.ok){ showToast(data.error || "İçe aktarma başarısız oldu."); return; }
      if(data.name) document.getElementById("fName").value = data.name;
      if(data.description) document.getElementById("fDesc").value = data.description;
      if(data.price) document.getElementById("fPrice").value = data.price;
      if(data.image){
        pendingImage = data.image;
        document.getElementById("fImageBox").innerHTML = `<img class="upload-preview" src="${data.image}">`;
      }
      showToast("Bulunan bilgiler dolduruldu — lütfen kontrol edip gerekirse düzenleyin.");
    }catch(e){
      showToast("İçe aktarma başarısız oldu — bu özellik her sitede çalışmayabilir.");
    }
  });

  document.getElementById("cancelProductBtn").addEventListener("click", () => { block.style.display = "none"; });
  document.getElementById("saveProductBtn").addEventListener("click", async () => {
    const body = {
      name: document.getElementById("fName").value,
      price: parseFloat(document.getElementById("fPrice").value),
      stock: parseInt(document.getElementById("fStock").value, 10),
      category: document.getElementById("fCategory").value,
      description: document.getElementById("fDesc").value,
      image: pendingImage,
      storeId: PD_STORE.id,
      emoji: "🛍️"
    };
    if(!body.name || !body.price){ showToast("Lütfen ürün adı ve fiyatını girin."); return; }
    if(product){
      await fetch("/api/products/" + product.id, { method:"PUT", body: JSON.stringify(body) });
      showToast("Ürün güncellendi.");
    }else{
      await fetch("/api/products", { method:"POST", body: JSON.stringify(body) });
      showToast("Ürün eklendi.");
    }
    renderProducts(document.getElementById("panelContent"));
  });
}

async function renderOrders(wrap){
  const orders = await (await fetch("/api/orders?storeId=" + PD_STORE.id)).json();
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Siparişler (${orders.length})</h3>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Sipariş No</th><th>Tarih</th><th>Bu Mağazanın Payı</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            ${orders.map(o => {
              const b = o.storeBreakdown.find(x=>x.storeId===PD_STORE.id);
              const pillClass = o.status === "shipped" ? "pill-shipped" : o.status === "preparing" ? "pill-preparing" : "pill-new";
              return `<tr data-id="${o.id}">
                <td>${o.id}</td>
                <td>${new Date(o.date).toLocaleDateString("tr-TR")}</td>
                <td>${b ? b.subtotal.toLocaleString("tr-TR") : 0} ₺</td>
                <td><span class="pill ${pillClass}">${o.status === "shipped" ? "Kargolandı" : o.status === "preparing" ? "Hazırlanıyor" : "Yeni"}</span></td>
                <td class="icon-btn-row">${o.status !== "shipped" ? `<button class="ok shipBtn">Kargola</button>` : ""}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="5" style="text-align:center;color:var(--ty-gray)">Henüz sipariş yok.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
  wrap.querySelectorAll(".shipBtn").forEach(btn => btn.addEventListener("click", async (e) => {
    const id = e.target.closest("tr").dataset.id;
    await fetch("/api/orders/" + id + "/status", { method:"PUT", body: JSON.stringify({ status: "shipped" }) });
    showToast("Sipariş kargolandı olarak işaretlendi.");
    renderOrders(wrap);
  }));
}

function renderProfile(wrap){
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Mağaza Profili</h3>
      <div class="ty-field">
        <label>Mağaza Logosu</label>
        <div class="upload-box" id="logoBox">${PD_STORE.logo ? `<img class="upload-preview" src="${PD_STORE.logo}">` : `<span>📷 Logo yüklemek için tıklayın</span>`}</div>
        <input type="file" id="logoInput" accept="image/*" style="display:none">
      </div>
      <div class="ty-field">
        <label>Mağaza Banner'ı</label>
        <div class="upload-box" id="bannerBox">${PD_STORE.banner ? `<img class="upload-preview" src="${PD_STORE.banner}" style="width:100%;height:100px;object-fit:cover">` : `<span>🖼️ Banner yüklemek için tıklayın</span>`}</div>
        <input type="file" id="bannerInput" accept="image/*" style="display:none">
      </div>
      <div class="ty-field"><label>Mağaza Açıklaması</label><textarea id="descInput" rows="4">${PD_STORE.desc}</textarea></div>
      <button class="btn btn-primary" id="saveProfileBtn">Profili Kaydet</button>
    </div>
  `;
  let pendingLogo = PD_STORE.logo, pendingBanner = PD_STORE.banner;
  document.getElementById("logoBox").addEventListener("click", () => document.getElementById("logoInput").click());
  document.getElementById("logoInput").addEventListener("change", async (e) => {
    if(!e.target.files[0]) return;
    pendingLogo = await compressImage(e.target.files[0], 300, 0.75);
    document.getElementById("logoBox").innerHTML = `<img class="upload-preview" src="${pendingLogo}">`;
  });
  document.getElementById("bannerBox").addEventListener("click", () => document.getElementById("bannerInput").click());
  document.getElementById("bannerInput").addEventListener("change", async (e) => {
    if(!e.target.files[0]) return;
    pendingBanner = await compressImage(e.target.files[0], 900, 0.75);
    document.getElementById("bannerBox").innerHTML = `<img class="upload-preview" src="${pendingBanner}" style="width:100%;height:100px;object-fit:cover">`;
  });
  document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const body = { logo: pendingLogo, banner: pendingBanner, desc: document.getElementById("descInput").value };
    const res = await fetch("/api/stores/" + PD_STORE.id, { method:"PUT", body: JSON.stringify(body) });
    PD_STORE = await res.json();
    showToast("Mağaza profili güncellendi.");
  });
}

function renderSettings(wrap){
  wrap.innerHTML = `
    <div class="panel-block">
      <h3>Komisyon & Ödeme Ayarları</h3>
      <div class="ty-field"><label>Komisyon Oranı (platform tarafından belirlenir)</label><input type="text" value="%${PD_STORE.commissionRate}" disabled></div>
      <div class="ty-field"><label>Alt Üye İşyeri Sağlayıcısı</label><input type="text" value="iyzico Pazaryeri (demo — bağlı değil)" disabled></div>
      <p class="ty-hint">Gerçek bir üründe, ödemeleriniz sipariş tamamlandığında sub-merchant destekli bir sağlayıcı (iyzico Pazaryeri, PayTR Pazaryeri) üzerinden doğrudan banka hesabınıza yatırılır. Bu demoda gerçek para hareketi bulunmamaktadır.</p>
    </div>
    <div class="panel-block">
      <h3>Hesap</h3>
      <p style="font-size:13px;color:var(--ty-gray)">Mağaza ID: <strong>${PD_STORE.id}</strong></p>
      <p style="font-size:13px;color:var(--ty-gray)">Durum: <span class="pill pill-active">${PD_STORE.status === "active" ? "Aktif" : PD_STORE.status}</span></p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  PD_STORE = await requireSession();
  if(!PD_STORE) return;
  const isAdminMode = new URLSearchParams(location.search).get("admin") === "1";
  document.getElementById("panelWho").innerHTML = isAdminMode
    ? `${PD_STORE.name} mağazasını <strong>admin olarak</strong> yönetiyorsunuz — <a href="admin.html" style="color:var(--ty-orange-dark);font-weight:600">← Admin Paneline Dön</a>`
    : `${PD_STORE.name} mağazası olarak giriş yaptınız`;

  document.querySelectorAll("#sideNav a").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); switchTab(a.dataset.tab);
  }));
  document.getElementById("partnerLogoutBtn").addEventListener("click", (e) => {
    e.preventDefault(); PartnerAuth.logout(); location.href = "partner-login.html";
  });
  const toggle = document.getElementById("mobileMenuToggle");
  if(toggle) toggle.addEventListener("click", () => document.getElementById("panelSidebar").classList.toggle("open"));

  render();
});
