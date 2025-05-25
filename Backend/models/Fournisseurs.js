const mongoose = require("mongoose");

const FournisseurSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, "Le contact est requis"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"]
  },
  phone: {
    type: String,
    required: [true, "Le numéro de téléphone est requis"],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, "L'adresse est requise"],
      trim: true
    },
    city: {
      type: String,
      required: [true, "La ville est requise"],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, "Le code postal est requis"],
      trim: true
    },
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true
    }
  },
  taxId: {
    type: String,
    required: [true, "Le numéro de TVA est requis"],
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Fournisseur", FournisseurSchema);
