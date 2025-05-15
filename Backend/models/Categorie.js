const mongoose = require("mongoose");

const CategorieSchema = new mongoose.Schema({
  name: String
}, { timestamps: true });

module.exports = mongoose.model("Categorie", CategorieSchema);
