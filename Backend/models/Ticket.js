const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["open", "in-progress", "closed"], default: "open" },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" }
}, { timestamps: true });

module.exports = mongoose.model("Ticket", TicketSchema);
