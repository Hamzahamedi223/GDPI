const mongoose = require("mongoose");

const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, 
}, { timestamps: true });

module.exports = mongoose.model("Model", ModelSchema);
