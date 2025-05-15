const Role = require("../models/Role");

async function createDefaultRole() {
    const roleExists = await Role.findOne({ name: "user" });
    if (!roleExists) {
      await new Role({ name: "user" }).save();
      console.log("✅ Default 'user' role created.");
    }
  }
  
  createDefaultRole();
exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });

    const existingRole = await Role.findOne({ name });
    if (existingRole) return res.status(400).json({ message: "Role already exists" });

    const role = new Role({ name });
    await role.save();

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.findByIdAndUpdate(req.params.id, { name }, { new: true });

    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
