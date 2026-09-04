let products = [];
let cart = CartStore.get();

async function init() {
  if (cart.length === 0) {
    window.location.href = "index.html";
    return;
  }
  const res = await fetch("/api/products");
  products = await res.json();
  renderSummary();
}

function renderSummary() {
  const grouped = {};
  let total = 0;

  cart.forEach((c) => {
    const p = products.find((x) => x.id === c.productId);
    if (!p) return;
    if (!grouped[p.storeId]) grouped[p.storeId] = { storeName: p.storeName, items: [] };
    const lineTotal = p.price * c.quantity;
    grouped[p.storeId].items.push({ name: p.name, quantity: c.quantity, lineTotal });
    total += lineTotal;
  });

  const storeGroups = Object.values(grouped);

  document.getElementById("summaryStores").innerHTML = storeGroups
    .map(
      (g) => `
    <div class="co-summary-store">
      <div class="co-summary-store-name">${g.storeName}</div>
      ${g.items
        .map(
          (i) => `<div class="co-summary-item"><span>${i.name} × ${i.quantity}</span><span>${i.lineTotal.toLocaleString("tr-TR")} ₺</span></div>`
        )
        .join("")}
    </div>`
    )
    .join("");

  document.getElementById("summaryTotal").textContent = `${total.toLocaleString("tr-TR")} ₺`;

  const note = document.getElementById("multiStoreNote");
  if (storeGroups.length > 1) {
    note.style.display = "block";
    note.innerHTML = `🛍️ Bu sipariş <strong>${storeGroups.length} farklı mağazadan</strong> ürün içeriyor. Tek ödeme yapacaksınız, arka planda otomatik olarak her mağazaya bölünecek ve her biri kendi kargosunu ayrı gönderecek.`;
  } else {
    note.style.display = "none";
  }
}

function goToPayment() {
  document.getElementById("panelAddress").classList.add("hidden");
  document.getElementById("panelPayment").classList.remove("hidden");
  document.getElementById("tabAddress").classList.remove("active");
  document.getElementById("tabAddress").classList.add("done");
  document.getElementById("tabPayment").classList.add("active");
}

function goToAddress() {
  document.getElementById("panelPayment").classList.add("hidden");
  document.getElementById("panelAddress").classList.remove("hidden");
  document.getElementById("tabPayment").classList.remove("active");
  document.getElementById("tabAddress").classList.add("active");
  document.getElementById("tabAddress").classList.remove("done");
}

function updateCardPreview() {
  const number = document.getElementById("pNumber").value || "•••• •••• •••• ••••";
  const name = document.getElementById("pName").value || "AD SOYAD";
  const exp = document.getElementById("pExpiry").value || "AA/YY";
  document.getElementById("cardNumberPreview").textContent = number;
  document.getElementById("cardNamePreview").textContent = name.toUpperCase();
  document.getElementById("cardExpPreview").textContent = exp;
}

// Basit kart numarası biçimlendirme (4'lü gruplar)
document.getElementById("pNumber").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
  updateCardPreview();
});
document.getElementById("pExpiry").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  e.target.value = v;
  updateCardPreview();
});

async function submitPayment() {
  const payBtn = document.getElementById("payBtn");
  payBtn.disabled = true;
  payBtn.textContent = "İşleniyor...";

  const customer = {
    firstName: document.getElementById("fName").value,
    lastName: document.getElementById("fLastName").value,
    email: document.getElementById("fEmail").value,
    phone: document.getElementById("fPhone").value,
  };
  const shippingAddress = {
    city: document.getElementById("fCity").value,
    district: document.getElementById("fDistrict").value,
    addressLine: document.getElementById("fAddress").value,
  };

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems: cart, customer, shippingAddress }),
    });
    const data = await res.json();

    if (!data.success) {
      alert("Ödeme başarısız: " + data.error);
      payBtn.disabled = false;
      payBtn.textContent = "Ödemeyi Onayla";
      return;
    }

    showDone(data);
    CartStore.clear();
  } catch (err) {
    alert("Hata: " + err.message);
    payBtn.disabled = false;
    payBtn.textContent = "Ödemeyi Onayla";
  }
}

function showDone(data) {
  document.getElementById("panelPayment").classList.add("hidden");
  document.getElementById("panelDone").classList.remove("hidden");
  document.getElementById("tabPayment").classList.remove("active");
  document.getElementById("tabPayment").classList.add("done");
  document.getElementById("tabDone").classList.add("active");

  document.getElementById("panelDone").innerHTML = `
    <h2>✅ Ödeme Alındı — Tek Sipariş, Otomatik Bölündü</h2>
    <p><strong>Sipariş No:</strong> ${data.order.orderNumber}</p>
    <p><strong>Toplam Tahsilat:</strong> ${data.order.totalAmount.toLocaleString("tr-TR")} ₺ (İşlem ID: ${data.providerPaymentId})</p>
    <p><strong>Platform Komisyonu:</strong> ${data.order.totalCommission.toLocaleString("tr-TR")} ₺</p>
    <hr />
    <p style="font-size:13px;color:#6b756f;">Sepet ${data.subOrders.length} mağazaya bölündü, her biri kendi alt siparişini ve kargosunu yönetecek:</p>
    ${data.subOrders
      .map(
        (so) => `
      <div class="suborder-card">
        <div class="suborder-title">${so.storeName} — ${so.subOrderNumber}</div>
        <div class="suborder-row"><span>Ürünler</span><strong>${so.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</strong></div>
        <div class="suborder-row"><span>Mağaza Cirosu</span><strong>${so.subtotal.toLocaleString("tr-TR")} ₺</strong></div>
        <div class="suborder-row"><span>Platform Komisyonu</span><strong>-${so.commission.toLocaleString("tr-TR")} ₺</strong></div>
        <div class="suborder-row"><span>Mağazaya Net Ödenecek</span><strong>${so.payout.toLocaleString("tr-TR")} ₺</strong></div>
        <div class="suborder-row"><span>Durum</span><strong>${so.status}</strong></div>
      </div>`
      )
      .join("")}
    <a href="index.html" class="close-modal-btn" style="display:block;text-align:center;text-decoration:none;box-sizing:border-box;">Alışverişe Devam Et</a>
  `;
}

init();
