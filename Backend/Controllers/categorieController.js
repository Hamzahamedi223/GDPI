const Categorie = require("../models/Categorie");

exports.createCategorie = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Le nom de la catégorie est requis." });
    }

    const existingCat = await Categorie.findOne({ name: name.trim() });
    if (existingCat) {
      return res.status(400).json({ message: "La catégorie existe déjà." });
    }

    const categorie = new Categorie({ name: name.trim() });
    await categorie.save();

    res.status(201).json({ message: "Catégorie créée avec succès.", categorie });
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur.", error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur.", error: error.message });
  }
};

exports.getCategorieById = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);

    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json({ categorie });
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur.", error: error.message });
  }
};

exports.updateCategorie = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Le nom de la catégorie est requis." });
    }

    const updatedCategorie = await Categorie.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );

    if (!updatedCategorie) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json({ message: "Catégorie mise à jour avec succès.", categorie: updatedCategorie });
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur.", error: error.message });
  }
};

exports.deleteCategorie = async (req, res) => {
  try {
    const deletedCategorie = await Categorie.findByIdAndDelete(req.params.id);

    if (!deletedCategorie) {
      return res.status(404).json({ message: "Catégorie non trouvée." });
    }

    res.status(200).json({ message: "Catégorie supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur.", error: error.message });
  }
};
