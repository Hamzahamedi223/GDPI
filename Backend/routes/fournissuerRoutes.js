const express = require("express");
const router = express.Router();
const fournissuerController = require("../Controllers/FournisseurController");

router.get("/", fournissuerController.getFournisseurs);
router.post("/", fournissuerController.createFournisseur);
router.get("/:id", fournissuerController.getFournisseurById);
router.put("/:id", fournissuerController.updateFournisseur); 
router.delete("/:id", fournissuerController.deleteFournisseur); 

module.exports = router;
