const User = require("../models/Signup");
const Department = require("../models/Department");

exports.getAllUser = async (req, res) => {
 try {
    const users = await User.find().populate("role department");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    // First, find the department by name
    const departmentDoc = await Department.findOne({ name: department });
    
    if (!departmentDoc) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Then find users with that department ID
    const users = await User.find({ department: departmentDoc._id }).populate("role department");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSingleUser = async (req, res) => {
  try {
     const user = await User.findById(req.params.id).populate("role department");
     if (!user) return res.status(404).json({ message: "User not found" });
     res.json(user);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
};

exports.createUser = async (req, res) => {
 try {
     const user = new User(req.body);
     await user.save();
     res.status(201).json(user);
   } catch (error) {
     res.status(400).json({ error: error.message });
   }
};

exports.updateUser = async (req, res) => {
  try {
     const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
     res.json(user);
   } catch (error) {
     res.status(400).json({ error: error.message });
   }
};

exports.deleteUser = async (req, res) => {
 try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
