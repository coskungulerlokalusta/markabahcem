const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: "" },
  sub: { type: String, default: "" },
  cta: { type: String, default: "İncele" },
  link: { type: String, default: "index.html" },
  color: { type: String, default: "#f27a1a" },
  image: { type: String, default: null }
}, { _id: false });

const discountCardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  title: { type: String, default: "" },
  color: { type: String, default: "#f27a1a" },
  link: { type: String, default: "index.html" }
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
  singleton: { type: String, default: "main", unique: true },
  logo: { type: String, default: null },
  siteName: { type: String, default: "markabahçem.com" },
  fontFamily: { type: String, default: "" },
  brandsHeading: { type: String, default: "Markalar" },
  allBrandsIcon: { type: String, default: null },
  discountHeading: { type: String, default: "Kategorilerde İndirim" },
  discountCards: { type: [discountCardSchema], default: [] },
  flashHeading: { type: String, default: "⚡ Flaş Ürünler" },
  flashSlogan: { type: String, default: "Fırsatlar sona ermeden yakala" },
  flashProductIds: { type: [String], default: [] },
  banners: { type: [bannerSchema], default: [] }
}, { timestamps: { updatedAt: true, createdAt: false } });

siteSettingsSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.singleton;
    return ret;
  }
});

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
