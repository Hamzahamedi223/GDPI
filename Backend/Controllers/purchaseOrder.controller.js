const PurchaseOrder = require("../models/PurchaseOrder");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/purchase-orders");
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
    if (file.mimetype === "application/pdf" || 
        file.mimetype === "application/msword" || 
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed"), false);
    }
  },
}).single("document");

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("fournisseur")
      .sort({ createdAt: -1 });
    res.json(purchaseOrders);
  } catch (error) {
    console.error("Error getting purchase orders:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSinglePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate("fournisseur");
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.json(purchaseOrder);
  } catch (error) {
    console.error("Error getting single purchase order:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      const purchaseOrder = new PurchaseOrder({
        reference: req.body.reference,
        date: req.body.date,
        fournisseur: req.body.fournisseur,
        details: req.body.details,
        document: req.file ? `/uploads/purchase-orders/${req.file.filename}` : null,
        status: req.body.status || "pending"
      });

      const savedOrder = await purchaseOrder.save();
      console.log("Saved purchase order:", savedOrder);
      res.status(201).json(savedOrder);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(400).json({ error: error.message });
    }
  });
};

exports.updatePurchaseOrder = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const updateData = {
        reference: req.body.reference,
        date: req.body.date,
        fournisseur: req.body.fournisseur,
        details: req.body.details,
        status: req.body.status
      };

      if (req.file) {
        updateData.document = `/uploads/purchase-orders/${req.file.filename}`;
      }

      const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("fournisseur");

      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      res.json(purchaseOrder);
    } catch (error) {
      console.error("Error updating purchase order:", error);
      res.status(400).json({ error: error.message });
    }
  });
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (purchaseOrder.document) {
      const filePath = path.join(__dirname, "..", purchaseOrder.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ error: error.message });
  }
}; 