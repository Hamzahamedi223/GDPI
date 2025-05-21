// routes/index.js
const express = require("express");
const authRoutes = require("./authRoutes");
const ticketRoutes = require("./ticketRoutes");
const userRoutes = require("./userRoutes");
const equipmentRoutes = require("./equipmentRoutes");
const departmentRoutes = require("./departmentRoutes");
const roleRoutes = require("./roleRoutes");
const categorieRoutes = require("./categorieRoutes");
const modelRoutes = require("./modelRoutes");
const spareParts = require("./spareParts");
const supplierRoutes = require("./suppliers");
const fournisseurRoutes = require("./fournissuerRoutes");
const internalRepairRoutes = require("./internalRepairRoutes");
const purchaseOrderRoutes = require("./purchaseOrderRoutes");
const exitFormRoutes = require("./exitFormRoutes");
const deliveryOrderRoutes = require("./deliveryOrderRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const profileRoutes = require("./profileRoutes");
const reclamationRoutes = require('./reclamationRoutes');
const besoinRoutes = require('./besoinRoutes');
const panneRoutes = require('./panneRoutes');
const panneTypeRoutes = require('./panneTypeRoutes');

const router = express.Router();
console.log("📌 Index routes file is loaded");

// Register all routes
router.use("/auth", authRoutes);
router.use("/fournisseurs", fournisseurRoutes);
router.use("/users", userRoutes);
router.use("/tickets", ticketRoutes);
router.use("/spareParts", spareParts);
router.use("/equipment", equipmentRoutes);
router.use("/departments", departmentRoutes);
router.use("/roles", roleRoutes);
router.use("/categories", categorieRoutes);
router.use("/models", modelRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/internal-repairs", internalRepairRoutes);
router.use("/purchase-orders", purchaseOrderRoutes);
router.use("/exit-forms", exitFormRoutes);
router.use("/delivery-orders", deliveryOrderRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profile", profileRoutes);
router.use('/reclamations', reclamationRoutes);
router.use('/besoins', besoinRoutes);
router.use('/pannes', panneRoutes);
router.use('/panne-types', panneTypeRoutes);

module.exports = router; 