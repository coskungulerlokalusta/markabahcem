// Ürün başına deterministik "sahte" puan/yorum/indirim üretimi (sadece görsel demo verisi).
// Gerçek üretimde bunun yerini gerçek yorum/puan/kampanya verisi alır.
function mockMeta(product) {
  const seed = product.id.charCodeAt(product.id.length - 1);
  const rating = (4 + (seed % 10) / 10).toFixed(1);
  const reviewCount = 20 + ((seed * 37) % 900);
  const hasDiscount = seed % 3 === 0;
  const discountPct = hasDiscount ? 10 + (seed % 30) : 0;
  const oldPrice = hasDiscount ? Math.round(product.price / (1 - discountPct / 100)) : null;
  const freeShip = seed % 2 === 0;
  const favoriteCount = 100 + ((seed * 173) % 9000);
  const fastDelivery = seed % 4 !== 0;
  return { rating, reviewCount, hasDiscount, discountPct, oldPrice, freeShip, favoriteCount, fastDelivery };
}
