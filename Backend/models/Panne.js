const mongoose = require('mongoose');

const panneSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'Equipment reference is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PanneType',
    required: [true, 'Panne type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup',
    required: [true, 'Reporter is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup'
  },
  resolution: {
    type: String,
    trim: true
  },
  resolutionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Panne', panneSchema); 