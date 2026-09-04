// markabahçem — statik siteyi Hostinger "Web Apps" (Node.js) hosting üzerinde
// sunmak için minimal Express sunucusu. Site tamamen statik HTML/CSS/JS'ten
// oluşuyor (gerçek bir backend yok, veriler tarayıcıda localStorage'da tutulur);
// bu dosya sadece o statik dosyaları doğru şekilde HTTP üzerinden servis eder.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Türkçe karakterlerin bozulmaması için doğru charset başlıkları
app.use(
  express.static(path.join(__dirname), {
    extensions: ["html"],
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html; charset=UTF-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=UTF-8");
      } else if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "text/javascript; charset=UTF-8");
      }
    },
  })
);

// Bilinmeyen bir yol istenirse ana sayfaya yönlendir (404 yerine)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`markabahçem ${PORT} portunda çalışıyor`);
});
