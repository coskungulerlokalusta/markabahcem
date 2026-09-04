let megaCategories = [];
let megaActiveCategory = null;

async function loadMegaMenu() {
  const res = await fetch("/api/categories");
  megaCategories = await res.json();
  if (megaCategories.length > 0) {
    megaActiveCategory = megaCategories[0].id;
  }
  renderMegaLeft();
  renderMegaRight();
}

function renderMegaLeft() {
  const left = document.getElementById("megaLeft");
  left.innerHTML = megaCategories
    .map(
      (cat) => `
    <div class="ty-mega-store-item ${cat.id === megaActiveCategory ? "active" : ""}"
         onmouseenter="setMegaActiveCategory('${cat.id}')">
      <span class="emoji">${cat.icon}</span> ${cat.name}
    </div>`
    )
    .join("");
}

function setMegaActiveCategory(catId) {
  megaActiveCategory = catId;
  renderMegaLeft();
  renderMegaRight();
}

function renderMegaRight() {
  const cat = megaCategories.find((c) => c.id === megaActiveCategory);
  const right = document.getElementById("megaRight");
  if (!cat) {
    right.innerHTML = "";
    return;
  }

  const cols = cat.groups
    .map(
      (g) => `
    <div class="ty-mega-col">
      <h4>${g.title}</h4>
      ${g.items.map((item) => `<a href="category.html?cat=${cat.id}&sub=${encodeURIComponent(item)}">${item}</a>`).join("")}
    </div>`
    )
    .join("");

  right.innerHTML = `
    ${cols}
    <div class="ty-mega-promo">
      🛍️ ${cat.name} kategorisindeki tüm ürünleri görmek için <a href="category.html?cat=${cat.id}" style="color:inherit;text-decoration:underline;display:inline;padding:0;">buraya tıkla</a>.
    </div>
  `;
}

function toggleMegaMenu(forceState) {
  const menu = document.getElementById("megaMenu");
  const trigger = document.getElementById("megaTrigger");
  const shouldOpen = forceState !== undefined ? forceState : !menu.classList.contains("open");
  menu.classList.toggle("open", shouldOpen);
  trigger.classList.toggle("open", shouldOpen);
}

document.getElementById("megaTrigger").addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMegaMenu();
});
document.addEventListener("click", (e) => {
  const menu = document.getElementById("megaMenu");
  if (!menu.contains(e.target)) toggleMegaMenu(false);
});

loadMegaMenu();
