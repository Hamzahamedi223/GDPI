const express = require("express");
const router = express.Router();
const devisController = require("../Controllers/DevisController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Devis routes
router.post("/", devisController.createDevis);
router.get("/", devisController.getDevis);
router.get("/:id", devisController.getDevisById);
router.put("/:id", devisController.updateDevis);
router.delete("/:id", devisController.deleteDevis);
router.patch("/:id/status", devisController.updateDevisStatus);

module.exports = router; 