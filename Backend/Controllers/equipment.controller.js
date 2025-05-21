const Equipment = require("../models/Equipment");

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find()
    .populate("department")
    .populate("model")
    .populate("categorie")
    .populate("fournisseur");
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSingleEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
    .populate("department")
    .populate("model")
    .populate("categorie")
    .populate("fournisseur");
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("department")
    .populate("model")
    .populate("categorie")
    .populate("fournisseur");
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: "Equipment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEquipmentByDepartment = async (req, res) => {
  try {
    const departmentName = req.params.department;
    const equipment = await Equipment.find()
      .populate({
        path: "department",
        match: { name: departmentName }
      })
      .populate("model")
      .populate("categorie")
      .populate("fournisseur");

    // Filter out equipment where department is null (due to the match condition)
    const filteredEquipment = equipment.filter(item => item.department !== null);
    
    res.json(filteredEquipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
