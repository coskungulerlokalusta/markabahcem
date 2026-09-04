/* mockMeta.js — ürün kartlarında yıldız/yorum gösterimi için yardımcı */
function renderStars(rating){
  rating = parseFloat(rating) || 0;
  const full = Math.round(rating);
  let stars = "";
  for(let i=0;i<5;i++) stars += i < full ? "★" : "☆";
  return stars;
}
function formatReviewMeta(product){
  return `${renderStars(product.rating)} <span style="margin-left:4px">${product.rating}</span> · ${product.reviewCount} değerlendirme`;
}
