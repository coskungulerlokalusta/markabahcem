function wireHeaderSearch() {
  const input = document.getElementById("searchInput");
  const btn = document.getElementById("searchBtn");
  if (!input || !btn) return;

  const params = new URLSearchParams(window.location.search);
  const currentQ = params.get("q");
  if (currentQ) input.value = currentQ;

  const go = () => {
    const q = input.value.trim();
    if (!q) return;
    window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  };

  btn.addEventListener("click", go);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  });
}

document.addEventListener("DOMContentLoaded", wireHeaderSearch);
