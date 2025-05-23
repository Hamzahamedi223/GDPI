const express = require("express");
const router = express.Router();
const departmentController = require("../Controllers/departmentController");

router.get("/", departmentController.getDepartments);
router.post("/", departmentController.createDepartment);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment); 
router.delete("/:id", departmentController.deleteDepartment); 

module.exports = router;
