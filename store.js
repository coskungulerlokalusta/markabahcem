async function loadStores() {
  const res = await fetch("/api/stores");
  const stores = await res.json();

  const select = document.getElementById("storeSelect");
  select.innerHTML = stores.map((s) => `<option value="${s.slug}">${s.name}</option>`).join("");
  select.addEventListener("change", () => loadStoreOrders(select.value));

  loadStoreOrders(stores[0].slug);
}

async function loadStoreOrders(slug) {
  const res = await fetch(`/api/stores/${slug}/orders`);
  const data = await res.json();

  const tbody = document.getElementById("ordersBody");
  const emptyMsg = document.getElementById("emptyMsg");

  if (data.subOrders.length === 0) {
    tbody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  tbody.innerHTML = data.subOrders
    .map(
      (so) => `
    <tr>
      <td><strong>${so.subOrderNumber}</strong></td>
      <td>${so.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</td>
      <td>${so.subtotal.toLocaleString("tr-TR")} ₺</td>
      <td>-${so.commission.toLocaleString("tr-TR")} ₺</td>
      <td><strong>${so.payout.toLocaleString("tr-TR")} ₺</strong></td>
      <td><span class="status-badge">${so.status}</span></td>
      <td>${so.externalOrderId || "-"}</td>
    </tr>`
    )
    .join("");
}

loadStores();
