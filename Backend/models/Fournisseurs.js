const mongoose = require("mongoose");

const FournisseurSchema = new mongoose.Schema({
  name: String
}, { timestamps: true });

module.exports = mongoose.model("Fournisseur", FournisseurSchema);
