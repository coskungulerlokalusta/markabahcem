/**
 * server.js — markabahçem
 *
 * Bu, siteye hiçbir işlevsel katkısı olmayan minimal bir Express sunucusudur.
 * Site tamamen istemci taraflı (statik HTML/CSS/JS) çalışır; gerçek backend
 * mantığı js/static-api.js içindeki fetch-override ile tarayıcıda simüle edilir.
 *
 * Bu dosya SADECE, "Web Uygulaması / Node.js" bekleyen hosting ortamlarına
 * (ör. Hostinger) uyum sağlamak için var — düz statik dosyaları servis eder.
 *
 * ⚠️ ÖNEMLİ: app.listen(PORT) YETERLİ DEĞİLDİR. Bazı hosting ortamlarının
 * proxy'si uygulamaya sadece 0.0.0.0 üzerinden dinleniyorsa ulaşabilir;
 * aksi halde "dinliyorum" derken bile 503 Service Unavailable ile
 * sonuçlanan bir crash-loop oluşabilir. Bu yüzden aşağıda host olarak
 * "0.0.0.0" açıkça belirtilmiştir.
 */
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

// Basit health-check — hosting platformları için
app.get("/healthz", (req, res) => res.status(200).send("ok"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`markabahçem statik sunucusu çalışıyor: http://0.0.0.0:${PORT}`);
});
