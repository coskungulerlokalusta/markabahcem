/* loginPage.js — login.html mantığı (demo/sahte kimlik doğrulama) */
document.addEventListener("DOMContentLoaded", () => {
  if(Auth.isLoggedIn()){ location.href = "index.html"; return; }

  document.querySelectorAll("#authTabs button").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("#authTabs button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("loginForm").style.display = btn.dataset.tab === "login" ? "block" : "none";
    document.getElementById("registerForm").style.display = btn.dataset.tab === "register" ? "block" : "none";
  }));

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const res = await fetch("/api/auth/login", { method:"POST", body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(!res.ok){ showToast(data.error || "Giriş başarısız."); return; }
    Auth.setUser(data);
    showToast("Giriş başarılı, yönlendiriliyorsunuz...");
    setTimeout(() => location.href = "index.html", 500);
  });

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const res = await fetch("/api/auth/register", { method:"POST", body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if(!res.ok){ showToast(data.error || "Kayıt başarısız."); return; }
    Auth.setUser(data);
    showToast("Hesabınız oluşturuldu!");
    setTimeout(() => location.href = "index.html", 500);
  });
});
