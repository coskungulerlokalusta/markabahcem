// Basit sepet deposu — sayfalar arasında (index.html <-> product.html) hatırlanması için
// localStorage kullanır. Not: Bu gerçek, kullanıcının kendi bilgisayarında npm start ile
// çalıştırdığı bağımsız bir web uygulamasıdır (Claude Artifacts değildir), bu yüzden
// localStorage burada güvenle kullanılabilir.
const CartStore = {
  KEY: "markabahcem_cart",

  get() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  save(cart) {
    localStorage.setItem(this.KEY, JSON.stringify(cart));
  },

  add(productId, qty = 1) {
    const cart = this.get();
    const existing = cart.find((c) => c.productId === productId);
    if (existing) existing.quantity += qty;
    else cart.push({ productId, quantity: qty });
    this.save(cart);
    return cart;
  },

  remove(productId) {
    const cart = this.get().filter((c) => c.productId !== productId);
    this.save(cart);
    return cart;
  },

  clear() {
    this.save([]);
  },
};
