const Fournisseur = require("../models/Fournisseurs");

async function createDefaultFournisseur() {
    try {
        const fournisseurExists = await Fournisseur.findOne({ name: "General" });
        if (!fournisseurExists) {
            await new Fournisseur({ 
                name: "General",
                contactPerson: "N/A",
                email: "general@example.com",
                phone: "N/A",
                address: {
                    street: "N/A",
                    city: "N/A",
                    postalCode: "N/A",
                    country: "N/A"
                },
                taxId: "N/A",
                status: "active"
            }).save();
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
        const {
            name,
            contactPerson,
            email,
            phone,
            address,
            taxId,
            status,
            notes
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Le nom du fournisseur est requis." });
        }

        const fournisseur = await Fournisseur.findByIdAndUpdate(
            req.params.id,
            {
                name,
                contactPerson,
                email,
                phone,
                address,
                taxId,
                status,
                notes
            },
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
        const {
            name,
            contactPerson,
            email,
            phone,
            address,
            taxId,
            status,
            notes
        } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Le nom du fournisseur est requis." });
        }

        const existingFournisseur = await Fournisseur.findOne({ 
            $or: [
                { name: name },
                { email: email }
            ]
        });

        if (existingFournisseur) {
            return res.status(400).json({ 
                message: "Un fournisseur avec ce nom ou cet email existe déjà." 
            });
        }

        const fournisseur = new Fournisseur({
            name,
            contactPerson,
            email,
            phone,
            address,
            taxId,
            status,
            notes
        });

        await fournisseur.save();

        res.status(201).json({ 
            message: "Fournisseur créé avec succès.", 
            fournisseur 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur serveur", 
            error: error.message 
        });
    }
};

exports.getFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find().sort({ createdAt: -1 });
        res.status(200).json({ fournisseurs });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getFournisseurById = async (req, res) => {
    try {
        const fournisseur = await Fournisseur.findById(req.params.id);
        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur non trouvé." });
        }
        res.status(200).json({ fournisseur });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
