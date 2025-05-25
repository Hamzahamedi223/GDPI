const mongoose = require("mongoose");

const DevisSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: [true, "La référence est requise"],
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: [true, "La date est requise"],
    default: Date.now
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fournisseur",
    required: [true, "Le fournisseur est requis"]
  },
  items: [{
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, "La quantité est requise"],
      min: [1, "La quantité doit être supérieure à 0"]
    },
    unitPrice: {
      type: Number,
      required: [true, "Le prix unitaire est requis"],
      min: [0, "Le prix ne peut pas être négatif"]
    },
    total: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, "Le montant total est requis"],
    min: [0, "Le montant total ne peut pas être négatif"]
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  validUntil: {
    type: Date,
    required: [true, "La date de validité est requise"]
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Signup",
    required: [true, "L'utilisateur est requis"]
  }
}, {
  timestamps: true
});

// Calculate total for each item before saving
DevisSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
  next();
});

module.exports = mongoose.model("Devis", DevisSchema); 