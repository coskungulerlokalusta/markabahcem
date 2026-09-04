/* headerSearch.js — header'daki arama kutusunun search.html'e yönlendirmesi */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("headerSearchForm");
  const input = document.getElementById("headerSearchInput");
  if(!form || !input) return;
  const params = new URLSearchParams(location.search);
  if(params.get("q")) input.value = params.get("q");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const q = input.value.trim();
    if(q) location.href = "search.html?q=" + encodeURIComponent(q);
  });
});
