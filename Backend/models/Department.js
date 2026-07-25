const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: String
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);
