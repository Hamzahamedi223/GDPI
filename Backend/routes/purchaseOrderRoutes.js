const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../Controllers/purchaseOrder.controller");

router.get("/", purchaseOrderController.getAllPurchaseOrders);
router.get("/:id", purchaseOrderController.getSinglePurchaseOrder);
router.post("/", purchaseOrderController.createPurchaseOrder);
router.put("/:id", purchaseOrderController.updatePurchaseOrder);
router.delete("/:id", purchaseOrderController.deletePurchaseOrder);

module.exports = router; 