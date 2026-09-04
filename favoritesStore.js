const FavoritesStore = {
  KEY: "markabahcem_favorites",

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  has(productId) {
    return this.get().includes(productId);
  },

  toggle(productId) {
    let favs = this.get();
    if (favs.includes(productId)) {
      favs = favs.filter((id) => id !== productId);
    } else {
      favs.push(productId);
    }
    localStorage.setItem(this.KEY, JSON.stringify(favs));
    return favs;
  },
};

function updateFavoriteCountBadge() {
  const el = document.getElementById("favCount");
  if (!el) return;
  el.textContent = FavoritesStore.get().length;
}

document.addEventListener("DOMContentLoaded", updateFavoriteCountBadge);
