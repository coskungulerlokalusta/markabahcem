/* favoritesStore.js — Favoriler (localStorage) */
const FavoritesStore = {
  KEY: "markabahcem_favorites",
  getIds(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }catch(e){ return []; }
  },
  save(ids){
    localStorage.setItem(this.KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("favorites:changed"));
  },
  isFav(productId){ return this.getIds().includes(productId); },
  toggle(productId){
    let ids = this.getIds();
    if(ids.includes(productId)) ids = ids.filter(id => id !== productId);
    else ids.push(productId);
    this.save(ids);
    return ids.includes(productId);
  },
  count(){ return this.getIds().length; }
};
