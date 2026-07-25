const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");


router.get("/", protect, authorize("admin"), userController.getAllUser);
router.get("/department/:department", protect, userController.getUsersByDepartment);
router.get("/:id", protect, userController.getSingleUser);
router.post("/", protect, authorize("admin"), userController.createUser);
router.put("/:id", protect, authorize("admin"), userController.updateUser);
router.put("/:id/password", protect, authorize("admin"), userController.changePassword);
router.delete("/:id", protect, authorize("admin"), userController.deleteUser);
module.exports = router;
