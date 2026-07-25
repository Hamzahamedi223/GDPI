const express = require("express");
const router = express.Router();
const categorieController = require("../Controllers/categorieController");

router.post("/", categorieController.createCategorie);
router.get("/", categorieController.getCategories);
router.get("/:id", categorieController.getCategorieById);
router.put("/:id", categorieController.updateCategorie);
router.delete("/:id", categorieController.deleteCategorie);

module.exports = router;
