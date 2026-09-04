/* checkout.js — 3 adımlı checkout akışı (Adres → Ödeme → Onay).
   ⚠️ Gerçek ödeme YOKTUR. Kart bilgisi hiçbir yere gönderilmez, sadece
   görsel bir simülasyondur. Sepette birden fazla mağaza varsa toplam
   her mağaza için ayrı ayrı kırılımlanır (gerçek hayatta bu, iyzico/
   PayTR Pazaryeri gibi bir alt-üye-işyeri sağlayıcısıyla otomatik olurdu). */

const DEMO_ADDRESSES = [
  { id: "a1", title: "Ev", name: "Demo Kullanıcı", detail: "Caferağa Mah. Moda Cad. No:12 Kadıköy / İstanbul" },
  { id: "a2", title: "İş", name: "Demo Kullanıcı", detail: "Levent Mah. Büyükdere Cad. No:200 Şişli / İstanbul" }
];
let CHECKOUT_STEP = 1;
let SELECTED_ADDRESS = DEMO_ADDRESSES[0].id;

function setStep(step){
  CHECKOUT_STEP = step;
  document.querySelectorAll("#checkoutSteps .step").forEach(el => {
    const n = parseInt(el.dataset.step, 10);
    el.classList.toggle("active", n === step);
    el.classList.toggle("done", n < step);
  });
  renderStepContent();
}

function renderStepContent(){
  const wrap = document.getElementById("checkoutContent");
  const items = CartStore.getItems();

  if(items.length === 0 && CHECKOUT_STEP !== 3){
    wrap.innerHTML = `<div class="ty-page-empty"><div class="big">🛒</div><p>Sepetiniz boş, ödemeye geçmeden önce ürün ekleyin.</p><a href="index.html" class="btn btn-primary">Alışverişe Başla</a></div>`;
    return;
  }

  if(CHECKOUT_STEP === 1) return renderAddressStep(wrap);
  if(CHECKOUT_STEP === 2) return renderPaymentStep(wrap);
  if(CHECKOUT_STEP === 3) return renderSuccessStep(wrap);
}

function renderSummary(){
  const groups = CartStore.groupByStore();
  const multi = groups.length > 1;
  return `
    <div class="summary-box">
      <h3 style="font-size:15px;margin-bottom:14px">Sipariş Özeti</h3>
      ${multi ? `<div class="multi-store-note">🛍️ Sepetinizde <strong>${groups.length} farklı mağaza</strong>dan ürün var. Tek ödeme alınır; tutar, gerçek bir sistemde iyzico/PayTR Pazaryeri gibi bir alt-üye-işyeri sağlayıcısıyla otomatik olarak ilgili markalara bölünür.</div>` : ""}
      ${groups.map(g => `
        <div class="store-group">
          <div class="store-name">🏬 ${g.storeName}</div>
          ${g.items.map(i => `<div class="line-item"><span>${i.name} × ${i.qty}</span><span>${(i.price*i.qty).toLocaleString("tr-TR")} ₺</span></div>`).join("")}
          <div class="store-subtotal">Ara toplam: ${g.subtotal.toLocaleString("tr-TR")} ₺ → ${g.storeName} hesabına</div>
        </div>
      `).join("")}
      <div class="row"><span>Ara Toplam</span><span>${CartStore.total().toLocaleString("tr-TR")} ₺</span></div>
      <div class="row"><span>Kargo</span><span>Mağaza tarafından</span></div>
      <div class="row total"><span>Genel Toplam</span><span>${CartStore.total().toLocaleString("tr-TR")} ₺</span></div>
    </div>
  `;
}

function renderAddressStep(wrap){
  wrap.innerHTML = `
    <div class="checkout-layout">
      <div>
        <div class="checkout-card">
          <h3>Teslimat Adresi</h3>
          ${DEMO_ADDRESSES.map(a => `
            <div class="address-option ${SELECTED_ADDRESS===a.id?"selected":""}" data-id="${a.id}">
              <strong>${a.title}</strong>
              <p>${a.name} — ${a.detail}</p>
            </div>
          `).join("")}
          <button class="btn btn-outline" id="addAddrBtn" style="margin-top:8px">+ Yeni Adres Ekle (demo)</button>
        </div>
        <button class="btn btn-primary btn-lg" id="toPaymentBtn">Ödeme Adımına Geç</button>
      </div>
      ${renderSummary()}
    </div>
  `;
  wrap.querySelectorAll(".address-option").forEach(el => el.addEventListener("click", () => {
    SELECTED_ADDRESS = el.dataset.id; renderAddressStep(wrap);
  }));
  const addBtn = document.getElementById("addAddrBtn");
  if(addBtn) addBtn.addEventListener("click", () => showToast("Bu bir demo — yeni adres eklemek gerçek bir backend gerektirir."));
  document.getElementById("toPaymentBtn").addEventListener("click", () => setStep(2));
}

function renderPaymentStep(wrap){
  wrap.innerHTML = `
    <div class="checkout-layout">
      <div>
        <div class="checkout-card">
          <h3>Ödeme Bilgileri (Demo — gerçek ödeme alınmaz)</h3>
          <div class="payment-fake-card">
            <div style="font-size:12px;opacity:.7">KART NUMARASI</div>
            <div style="font-size:19px;margin:10px 0">•••• •••• •••• 4242</div>
            <div style="display:flex;justify-content:space-between;font-size:12px"><span>DEMO KULLANICI</span><span>12/29</span></div>
          </div>
          <div class="ty-field"><label>Kart Üzerindeki İsim</label><input type="text" value="Demo Kullanıcı" disabled></div>
          <div style="display:flex;gap:12px">
            <div class="ty-field" style="flex:1"><label>Son Kullanma Tarihi</label><input type="text" value="12/29" disabled></div>
            <div class="ty-field" style="flex:1"><label>CVC</label><input type="text" value="•••" disabled></div>
          </div>
          <p class="ty-hint">🔒 Bu bir prototip ekrandır — hiçbir kart bilgisi gönderilmez ya da saklanmaz. Gerçek üründe ödeme, sub-merchant destekli bir sağlayıcı (iyzico/PayTR Pazaryeri) üzerinden doğrudan markaların hesaplarına aktarılır.</p>
        </div>
        <div style="display:flex; gap:10px">
          <button class="btn btn-outline" id="backAddrBtn">Geri</button>
          <button class="btn btn-primary btn-lg" id="payBtn" style="flex:1">Ödemeyi Tamamla (Demo)</button>
        </div>
      </div>
      ${renderSummary()}
    </div>
  `;
  document.getElementById("backAddrBtn").addEventListener("click", () => setStep(1));
  document.getElementById("payBtn").addEventListener("click", async () => {
    const btn = document.getElementById("payBtn");
    btn.disabled = true; btn.textContent = "İşleniyor...";
    const groups = CartStore.groupByStore();
    const order = {
      userId: (Auth.getUser() && Auth.getUser().id) || "guest",
      items: CartStore.getItems(),
      storeBreakdown: groups.map(g => ({ storeId: g.storeId, storeName: g.storeName, subtotal: g.subtotal })),
      total: CartStore.total(),
      address: DEMO_ADDRESSES.find(a=>a.id===SELECTED_ADDRESS)
    };
    setTimeout(async () => {
      const res = await fetch("/api/orders", { method:"POST", body: JSON.stringify(order) });
      const saved = await res.json();
      window.LAST_ORDER = saved;
      CartStore.clear();
      setStep(3);
    }, 700);
  });
}

function renderSuccessStep(wrap){
  const order = window.LAST_ORDER;
  wrap.innerHTML = `
    <div class="success-box">
      <div class="check">✓</div>
      <h2 style="font-size:22px;margin-bottom:8px">Siparişiniz Alındı!</h2>
      <p style="color:var(--ty-gray);margin-bottom:22px">Sipariş numaranız: <strong>${order ? order.id : "—"}</strong>. Her mağaza kendi ürününü ayrı ayrı kargolayacak.</p>
      ${order ? `<div style="max-width:420px;margin:0 auto 26px;text-align:left">${order.storeBreakdown.map(b=>`<div class="line-item" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--ty-border)"><span>🏬 ${b.storeName}</span><span>${b.subtotal.toLocaleString("tr-TR")} ₺</span></div>`).join("")}</div>` : ""}
      <a href="index.html" class="btn btn-primary btn-lg">Alışverişe Devam Et</a>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => setStep(1));
