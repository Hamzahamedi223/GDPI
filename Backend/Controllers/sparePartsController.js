const SparePart = require('../models/SparePart');

exports.getSpareParts = async (req, res) => {
  try {
    const spareParts = await SparePart.find()
      .populate('category')
      .populate('supplier')
      .populate('department');
    res.json(spareParts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSparePart = async (req, res) => {
  try {
    const newSparePart = new SparePart(req.body);
    await newSparePart.save();
    res.status(201).json(newSparePart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSparePart = async (req, res) => {
  try {
    const updatedPart = await SparePart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category')
      .populate('supplier')
      .populate('department');
    
    if (!updatedPart) {
      return res.status(404).json({ message: 'Pièce introuvable' });
    }
    res.json(updatedPart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSparePart = async (req, res) => {
  try {
    const deletedPart = await SparePart.findByIdAndDelete(req.params.id);
    if (!deletedPart) {
      return res.status(404).json({ message: 'Pièce introuvable' });
    }
    res.json({ message: 'Pièce supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};