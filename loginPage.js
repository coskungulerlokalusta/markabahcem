function switchTab(tab) {
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabRegister").classList.toggle("active", tab === "register");
  document.getElementById("panelLogin").classList.toggle("hidden", tab !== "login");
  document.getElementById("panelRegister").classList.toggle("hidden", tab !== "register");
}

function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Lütfen e-posta ve şifre girin.");
    return;
  }

  // Prototip: gerçek doğrulama yok, e-postanın @ öncesini isim olarak kullanıyoruz
  const name = email.split("@")[0].replace(/[._]/g, " ");
  AuthStore.login(name.charAt(0).toUpperCase() + name.slice(1), email);
  window.location.href = "index.html";
}

function doRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  AuthStore.login(name, email);
  window.location.href = "index.html";
}
