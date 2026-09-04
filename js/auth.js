/* auth.js — Müşteri oturumu (localStorage'da basit user objesi, demo amaçlı) */
const Auth = {
  KEY: "markabahcem_auth",
  getUser(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)); }catch(e){ return null; }
  },
  setUser(user){ localStorage.setItem(this.KEY, JSON.stringify(user)); },
  logout(){ localStorage.removeItem(this.KEY); },
  isLoggedIn(){ return !!this.getUser(); }
};

// Partner (mağaza) oturumu
const PartnerAuth = {
  KEY: "markabahcem_partner_auth",
  getSession(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)); }catch(e){ return null; }
  },
  setSession(s){ localStorage.setItem(this.KEY, JSON.stringify(s)); },
  logout(){ localStorage.removeItem(this.KEY); },
  isLoggedIn(){ return !!this.getSession(); }
};

// Admin oturumu
const AdminAuth = {
  KEY: "markabahcem_admin_auth",
  isLoggedIn(){ return localStorage.getItem(this.KEY) === "true"; },
  login(){ localStorage.setItem(this.KEY, "true"); },
  logout(){ localStorage.removeItem(this.KEY); }
};
