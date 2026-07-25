const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Equipment name is required"] 
  },
  categorie: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Categorie",
    required: [true, "Category reference is required"] 
  },
  model: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Model",
    required: [true, "Model reference is required"] 
  },
  serial_number: { 
    type: String, 
    required: [true, "Serial number is required"],
    unique: true 
  },
  purchase_date: { 
    type: Date, 
    required: [true, "Purchase date is required"] 
  },
  warranty_status: { 
    type: String, 
    enum: ["valid", "expired"], 
    default: "valid" 
  },
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department",
    required: [true, "Department reference is required"] 
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fournisseur",
    required: [true, "Supplier reference is required"]
  },
  prix: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"]
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Equipment", EquipmentSchema);
