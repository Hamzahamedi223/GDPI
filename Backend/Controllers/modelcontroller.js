const Model = require("../models/Model");

exports.getAllModels = async (req, res) => {
  try {
    const models = await Model.find();
    res.status(200).json({ models });
  } catch (err) {
    res.status(500).json({ message: "Error fetching models", error: err.message });
  }
};

exports.createModel = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existingModel = await Model.findOne({ name });
    if (existingModel) {
      return res.status(400).json({ message: "Model already exists" });
    }

    const newModel = await Model.create({ name });
    res.status(201).json({ model: newModel });
  } catch (err) {
    res.status(500).json({ message: "Error creating model", error: err.message });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updatedModel = await Model.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedModel) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.status(200).json({ model: updatedModel });
  } catch (err) {
    res.status(500).json({ message: "Error updating model", error: err.message });
  }
};

exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedModel = await Model.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.status(200).json({ message: "Model deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting model", error: err.message });
  }
};