const mongoose = require("mongoose");

const TicketHistorySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
}, { timestamps: true });

module.exports = mongoose.model("TicketHistory", TicketHistorySchema);
