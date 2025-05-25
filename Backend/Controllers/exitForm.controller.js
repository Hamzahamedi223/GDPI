const ExitForm = require("../models/ExitForm");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const uploadDir = path.join(__dirname, "../uploads/exit-forms");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents are allowed"), false);
    }
  },
}).single("document");

exports.getAllExitForms = async (req, res) => {
  try {
    const exitForms = await ExitForm.find()
      .populate("equipment")
      .sort({ createdAt: -1 });
    res.json(exitForms);
  } catch (error) {
    console.error("Error getting exit forms:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSingleExitForm = async (req, res) => {
  try {
    const exitForm = await ExitForm.findById(req.params.id)
      .populate("equipment");
    if (!exitForm) {
      return res.status(404).json({ message: "Exit form not found" });
    }
    res.json(exitForm);
  } catch (error) {
    console.error("Error getting single exit form:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createExitForm = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      // Parse the equipment array from the request body
      let equipment = [];
      try {
        equipment = JSON.parse(req.body.equipment);
        // Validate that all equipment IDs are valid ObjectIds
        if (!equipment.every(id => mongoose.Types.ObjectId.isValid(id))) {
          return res.status(400).json({ error: "Invalid equipment ID format" });
        }
      } catch (e) {
        console.error("Error parsing equipment:", e);
        return res.status(400).json({ error: "Invalid equipment data" });
      }

      const exitForm = new ExitForm({
        reference: req.body.reference,
        date: req.body.date,
        description: req.body.description || '',
        equipment: equipment,
        document: req.file ? `/uploads/exit-forms/${req.file.filename}` : undefined
      });

      const savedForm = await exitForm.save();
      const populatedForm = await ExitForm.findById(savedForm._id).populate("equipment");
      console.log("Saved exit form:", populatedForm);
      res.status(201).json(populatedForm);
    } catch (error) {
      console.error("Error creating exit form:", error);
      // Send more detailed error message
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: validationErrors.join(', ') });
      }
      res.status(400).json({ error: error.message });
    }
  });
};

exports.updateExitForm = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      let equipment = [];
      try {
        equipment = JSON.parse(req.body.equipment);
      } catch (e) {
        console.error("Error parsing equipment:", e);
        return res.status(400).json({ error: "Invalid equipment data" });
      }

      const updateData = {
        reference: req.body.reference,
        date: req.body.date,
        description: req.body.description,
        equipment: equipment
      };

      if (req.file) {
        updateData.document = `/uploads/exit-forms/${req.file.filename}`;
      }

      const exitForm = await ExitForm.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("equipment");

      if (!exitForm) {
        return res.status(404).json({ message: "Exit form not found" });
      }

      res.json(exitForm);
    } catch (error) {
      console.error("Error updating exit form:", error);
      res.status(400).json({ error: error.message });
    }
  });
};

exports.deleteExitForm = async (req, res) => {
  try {
    const exitForm = await ExitForm.findById(req.params.id);
    if (!exitForm) {
      return res.status(404).json({ message: "Exit form not found" });
    }

    if (exitForm.document) {
      const filePath = path.join(__dirname, "..", exitForm.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ExitForm.findByIdAndDelete(req.params.id);
    res.json({ message: "Exit form deleted successfully" });
  } catch (error) {
    console.error("Error deleting exit form:", error);
    res.status(500).json({ error: error.message });
  }
}; 