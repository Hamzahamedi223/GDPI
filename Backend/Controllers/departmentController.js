const Department = require("../models/Department");

async function createDefaultDepartment() {
  try {
    const deptExists = await Department.findOne({ name: "General" });
    if (!deptExists) {
      await new Department({ name: "General" }).save();
      console.log("✅ Default 'General' department created.");
    }
  } catch (error) {
    console.error("Error creating default department:", error);
  }
}

createDefaultDepartment();

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.updateDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom du Service est requis." });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } 
    );

    if (!department) {
      return res.status(404).json({ message: "Service non trouvé." });
    }

    res.status(200).json({ message: "Service mis à jour avec succès.", department });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required." });
    }

    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({ message: "Department already exists." });
    }

    const department = new Department({ name });
    await department.save();

    res.status(201).json({ message: "Department created successfully.", department });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ departments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json({ department });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
