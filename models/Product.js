const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  storeName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  emoji: { type: String, default: "🛍️" },
  image: { type: String, default: null },
  rating: { type: String, default: "4.0" },
  reviewCount: { type: Number, default: 0 },
  description: { type: String, default: "" },
  stock: { type: Number, default: 10 }
}, { timestamps: true });

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.storeId = ret.storeId.toString();
    ret.createdAt = new Date(ret.createdAt).getTime();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Product", productSchema);
