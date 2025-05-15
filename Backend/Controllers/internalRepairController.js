const InternalRepair = require('../models/InternalRepair');

// Get all internal repairs
exports.getAllInternalRepairs = async (req, res) => {
  try {
    const repairs = await InternalRepair.find()
      .populate('equipment', 'name serial_number')
      .populate('sparePart', 'name part_number');
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new internal repair
exports.createInternalRepair = async (req, res) => {
  const repair = new InternalRepair({
    equipment: req.body.equipment,
    sparePart: req.body.sparePart,
    description: req.body.description,
    repairDate: req.body.repairDate,
    status: req.body.status || 'pending'
  });

  try {
    const newRepair = await repair.save();
    res.status(201).json(newRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update internal repair
exports.updateInternalRepair = async (req, res) => {
  try {
    const repair = await InternalRepair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    if (req.body.equipment) repair.equipment = req.body.equipment;
    if (req.body.sparePart) repair.sparePart = req.body.sparePart;
    if (req.body.description) repair.description = req.body.description;
    if (req.body.repairDate) repair.repairDate = req.body.repairDate;
    if (req.body.status) repair.status = req.body.status;

    const updatedRepair = await repair.save();
    res.json(updatedRepair);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete internal repair
exports.deleteInternalRepair = async (req, res) => {
  try {
    const repair = await InternalRepair.findById(req.params.id);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    await repair.remove();
    res.json({ message: 'Repair deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 