const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file_url: String
}, { timestamps: true });

module.exports = mongoose.model("Attachment", AttachmentSchema);
