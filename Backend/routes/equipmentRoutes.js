const express = require("express");
const router = express.Router();
const equipmentController = require("../Controllers/equipment.controller");

// CRUD routes for Equipment
router.get("/", equipmentController.getAllEquipment);
router.get("/department/:department", equipmentController.getEquipmentByDepartment);
router.get("/:id", equipmentController.getSingleEquipment);
router.post("/", equipmentController.createEquipment);
router.put("/:id", equipmentController.updateEquipment);
router.delete("/:id", equipmentController.deleteEquipment);

module.exports = router;
