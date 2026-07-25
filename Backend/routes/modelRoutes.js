const express = require("express");
const router = express.Router();
const modelController = require("../Controllers/modelcontroller");


router.post("/", modelController.createModel);
router.get("/", modelController.getAllModels);
router.put("/:id",modelController.updateModel);
router.delete("/:id",modelController.deleteModel ); 
module.exports = router;
