const mongoose = require("mongoose");

const ExitFormSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, "Reference is required"],
    unique: true
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fournisseur",
    required: [true, "Supplier reference is required"]
  },
  equipment: {
    type: [String],
    required: [true, "At least one equipment is required"]
  },
  document: {
    type: String, 
    required: [true, "Document is required"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ExitForm", ExitFormSchema); 