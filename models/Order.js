const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: "guest" },
  items: { type: Array, default: [] },
  storeBreakdown: { type: Array, default: [] },
  total: { type: Number, required: true },
  address: { type: Object, default: {} },
  status: { type: String, enum: ["new", "preparing", "shipped"], default: "preparing" },
  date: { type: Date, default: Date.now }
});

orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Order", orderSchema);
