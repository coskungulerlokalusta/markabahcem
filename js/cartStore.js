/* cartStore.js — Sepet verisi (localStorage) */
const CartStore = {
  KEY: "markabahcem_cart",
  getItems(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }catch(e){ return []; }
  },
  save(items){
    localStorage.setItem(this.KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cart:changed"));
  },
  add(product, qty){
    qty = qty || 1;
    const items = this.getItems();
    const existing = items.find(i => i.productId === product.id);
    if(existing){ existing.qty += qty; }
    else{
      items.push({
        productId: product.id, name: product.name, price: product.price,
        storeId: product.storeId, storeName: product.storeName,
        emoji: product.emoji, image: product.image, qty: qty
      });
    }
    this.save(items);
  },
  updateQty(productId, qty){
    let items = this.getItems();
    if(qty <= 0){ items = items.filter(i => i.productId !== productId); }
    else{
      const it = items.find(i => i.productId === productId);
      if(it) it.qty = qty;
    }
    this.save(items);
  },
  remove(productId){
    this.save(this.getItems().filter(i => i.productId !== productId));
  },
  clear(){ this.save([]); },
  count(){ return this.getItems().reduce((sum,i)=>sum+i.qty, 0); },
  total(){ return this.getItems().reduce((sum,i)=>sum+i.qty*i.price, 0); },
  groupByStore(){
    const items = this.getItems();
    const groups = {};
    items.forEach(i => {
      if(!groups[i.storeId]) groups[i.storeId] = { storeId: i.storeId, storeName: i.storeName, items: [], subtotal: 0 };
      groups[i.storeId].items.push(i);
      groups[i.storeId].subtotal += i.qty * i.price;
    });
    return Object.values(groups);
  }
};
