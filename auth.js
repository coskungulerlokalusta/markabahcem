// Basit, gerçek şifreleme/backend doğrulaması olmayan demo oturum sistemi.
// Gerçek üretimde bunun yerini gerçek auth (JWT/session) alır.
const AuthStore = {
  KEY: "markabahcem_user",

  getUser() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  login(name, email) {
    const user = { name, email, loggedInAt: new Date().toISOString() };
    localStorage.setItem(this.KEY, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(this.KEY);
  },
};

// Sayfa header'ındaki "Giriş Yap" alanını oturum durumuna göre günceller.
function renderAuthHeader() {
  const el = document.getElementById("authAction");
  if (!el) return;
  const user = AuthStore.getUser();

  if (user) {
    el.innerHTML = `<span class="icon">👤</span>${user.name.split(" ")[0]}`;
    el.href = "#";
    el.onclick = (e) => {
      e.preventDefault();
      if (confirm("Çıkış yapmak istiyor musunuz?")) {
        AuthStore.logout();
        renderAuthHeader();
      }
    };
  } else {
    el.innerHTML = `<span class="icon">👤</span>Giriş Yap`;
    el.href = "login.html";
    el.onclick = null;
  }
}

document.addEventListener("DOMContentLoaded", renderAuthHeader);
