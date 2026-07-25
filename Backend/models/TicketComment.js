const mongoose = require("mongoose");

const TicketCommentSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("TicketComment", TicketCommentSchema);
