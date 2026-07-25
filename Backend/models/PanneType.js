const mongoose = require('mongoose');

const panneTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Type name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#6B7280' // Default gray color
  },
  icon: {
    type: String,
    default: 'alert-circle' // Default icon
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PanneType', panneTypeSchema); 