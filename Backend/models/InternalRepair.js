const mongoose = require('mongoose');

const internalRepairSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  sparePart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SparePart',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  repairDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InternalRepair', internalRepairSchema); 