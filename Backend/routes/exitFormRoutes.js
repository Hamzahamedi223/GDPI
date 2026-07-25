const express = require("express");
const router = express.Router();
const exitFormController = require("../Controllers/exitForm.controller");

// CRUD routes for Exit Forms
router.get("/", exitFormController.getAllExitForms);
router.get("/:id", exitFormController.getSingleExitForm);
router.post("/", exitFormController.createExitForm);
router.put("/:id", exitFormController.updateExitForm);
router.delete("/:id", exitFormController.deleteExitForm);

module.exports = router; 