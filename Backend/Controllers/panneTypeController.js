const PanneType = require('../models/PanneType');

// Get all panne types
exports.getAllPanneTypes = async (req, res) => {
  try {
    const types = await PanneType.find().sort({ name: 1 });
    res.status(200).json(types);
  } catch (error) {
    console.error('Error fetching panne types:', error);
    res.status(500).json({ message: 'Error fetching panne types', error: error.message });
  }
};

// Create a new panne type
exports.createPanneType = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existingType = await PanneType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: 'Panne type with this name already exists' });
    }

    const panneType = new PanneType({
      name,
      description,
      color,
      icon
    });

    await panneType.save();
    res.status(201).json(panneType);
  } catch (error) {
    console.error('Error creating panne type:', error);
    res.status(400).json({ message: 'Error creating panne type', error: error.message });
  }
};

// Update a panne type
exports.updatePanneType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    const panneType = await PanneType.findById(id);
    if (!panneType) {
      return res.status(404).json({ message: 'Panne type not found' });
    }

    if (name && name !== panneType.name) {
      const existingType = await PanneType.findOne({ name });
      if (existingType) {
        return res.status(400).json({ message: 'Panne type with this name already exists' });
      }
    }

    const updatedType = await PanneType.findByIdAndUpdate(
      id,
      { name, description, color, icon },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedType);
  } catch (error) {
    console.error('Error updating panne type:', error);
    res.status(400).json({ message: 'Error updating panne type', error: error.message });
  }
};

// Delete a panne type
exports.deletePanneType = async (req, res) => {
  try {
    const { id } = req.params;

    const panneType = await PanneType.findById(id);
    if (!panneType) {
      return res.status(404).json({ message: 'Panne type not found' });
    }

    await PanneType.findByIdAndDelete(id);
    res.status(200).json({ message: 'Panne type deleted successfully' });
  } catch (error) {
    console.error('Error deleting panne type:', error);
    res.status(500).json({ message: 'Error deleting panne type', error: error.message });
  }
}; 