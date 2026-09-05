const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  image: { type: String, default: null },
  link: { type: String, default: "index.html" },
  createdAt: { type: Date, default: Date.now }
});

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: "🏬" },
  logo: { type: String, default: null },
  banner: { type: String, default: null },
  desc: { type: String, default: "" },
  commissionRate: { type: Number, default: 10 },
  status: { type: String, enum: ["active", "paused"], default: "active" },
  categories: { type: [String], default: [] },
  stories: { type: [storySchema], default: [] },
  loginEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  loginPasswordHash: { type: String, required: true }
}, { timestamps: true });

storeSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.loginPasswordHash;
    return ret;
  }
});
storeSchema.virtual("id").get(function(){ return this._id.toString(); });

module.exports = mongoose.model("Store", storeSchema);
