const Fournisseur = require("../models/Fournisseurs");

async function createDefaultFournisseur() {
    try {
        const fournisseurExists = await Fournisseur.findOne({ name: "General" });
        if (!fournisseurExists) {
            await new Fournisseur({ name: "General" }).save();
            console.log("✅ Default 'General' fournisseur created.");
        }
    } catch (error) {
        console.error("Error creating default fournisseur:", error);
    }
}

createDefaultFournisseur();

exports.deleteFournisseur = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);

        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur not found." });
        }

        res.status(200).json({ message: "Fournisseur deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateFournisseur = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Le nom du fournisseur est requis." });
        }

        const fournisseur = await Fournisseur.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true } 
        );

        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur non trouvé." });
        }

        res.status(200).json({ message: "Fournisseur mis à jour avec succès.", fournisseur });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.createFournisseur = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Fournisseur name is required." });
        }

        const existingFournisseur = await Fournisseur.findOne({ name });
        if (existingFournisseur) {
            return res.status(400).json({ message: "Fournisseur already exists." });
        }

        const fournisseur = new Fournisseur({ name });
        await fournisseur.save();

        res.status(201).json({ message: "Fournisseur created successfully.", fournisseur });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find();
        res.status(200).json({ fournisseurs });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getFournisseurById = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findById(req.params.id);
        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur not found." });
        }
        res.status(200).json({ fournisseur });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
