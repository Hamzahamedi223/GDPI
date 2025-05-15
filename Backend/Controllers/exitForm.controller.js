const ExitForm = require("../models/ExitForm");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
      .populate("fournisseur")
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
      .populate("fournisseur");
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
      } catch (e) {
        console.error("Error parsing equipment:", e);
        return res.status(400).json({ error: "Invalid equipment data" });
      }

      const exitForm = new ExitForm({
        reference: req.body.reference,
        date: req.body.date,
        fournisseur: req.body.fournisseur,
        equipment: equipment,
        document: req.file ? `/uploads/exit-forms/${req.file.filename}` : null,
        status: req.body.status || "pending"
      });

      const savedForm = await exitForm.save();
      console.log("Saved exit form:", savedForm);
      res.status(201).json(savedForm);
    } catch (error) {
      console.error("Error creating exit form:", error);
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
        fournisseur: req.body.fournisseur,
        equipment: equipment,
        status: req.body.status
      };

      if (req.file) {
        updateData.document = `/uploads/exit-forms/${req.file.filename}`;
      }

      const exitForm = await ExitForm.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("fournisseur");

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