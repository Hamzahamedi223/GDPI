const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: { type: String, default: "none" }
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);
