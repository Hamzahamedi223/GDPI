const mongoose = require('mongoose');

const besoinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Le service est requis']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être supérieure à 0']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup',
    required: [true, 'L\'utilisateur est requis']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Besoin', besoinSchema); 