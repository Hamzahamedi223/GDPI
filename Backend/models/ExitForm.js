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
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  equipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: [true, "Equipment reference is required"]
  }],
  document: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ExitForm", ExitFormSchema); 