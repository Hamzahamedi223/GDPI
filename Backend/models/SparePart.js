const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Le nom est requis'] 
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categorie',
    required: [true, 'La catégorie est requise'] 
  },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fournisseur',
    required: [true, 'Le fournisseur est requis'] 
  },
  status: { 
    type: String, 
    enum: ['available', 'unavailable'], 
    default: 'available' 
  },
  part_number: { 
    type: String, 
    required: [true, 'Le numéro de pièce est requis'],
    unique: true 
  },
  purchase_date: { 
    type: Date, 
    required: [true, 'La date d\'achat est requise'] 
  },
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department',
    required: [true, 'Le Service est requis'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif'] 
  }
}, { timestamps: true });

module.exports = mongoose.model('SparePart', sparePartSchema);