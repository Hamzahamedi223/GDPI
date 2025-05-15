const express = require("express");
const RoleController = require("../Controllers/roleController");

const router = express.Router();

router.post("/", RoleController.createRole); 
router.get("/", RoleController.getRoles); 
router.get("/:id", RoleController.getRoleById); 
router.put("/:id", RoleController.updateRole); 
router.delete("/:id", RoleController.deleteRole); 

module.exports = router;
