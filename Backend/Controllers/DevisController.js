const Devis = require("../models/Devis");

exports.createDevis = async (req, res) => {
    try {
        const {
            reference,
            date,
            fournisseur,
            items,
            validUntil,
            notes
        } = req.body;

        // Check if reference already exists
        const existingDevis = await Devis.findOne({ reference });
        if (existingDevis) {
            return res.status(400).json({ 
                message: "Une référence de devis identique existe déjà." 
            });
        }

        const devis = new Devis({
            reference,
            date,
            fournisseur,
            items,
            validUntil,
            notes,
            createdBy: req.user._id // Assuming you have user info in req.user from auth middleware
        });

        await devis.save();

        res.status(201).json({ 
            message: "Devis créé avec succès.", 
            devis 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Erreur serveur", 
            error: error.message 
        });
    }
};

exports.getDevis = async (req, res) => {
    try {
        const devis = await Devis.find()
            .populate("fournisseur", "name contactPerson email phone")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ devis });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getDevisById = async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id)
            .populate("fournisseur", "name contactPerson email phone address")
            .populate("createdBy", "name email");
            
        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé." });
        }
        res.status(200).json({ devis });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.updateDevis = async (req, res) => {
    try {
        const {
            reference,
            date,
            fournisseur,
            items,
            validUntil,
            status,
            notes
        } = req.body;

        // Check if reference exists for another devis
        if (reference) {
            const existingDevis = await Devis.findOne({ 
                reference, 
                _id: { $ne: req.params.id } 
            });
            if (existingDevis) {
                return res.status(400).json({ 
                    message: "Une référence de devis identique existe déjà." 
                });
            }
        }

        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            {
                reference,
                date,
                fournisseur,
                items,
                validUntil,
                status,
                notes
            },
            { new: true }
        ).populate("fournisseur", "name contactPerson email phone")
         .populate("createdBy", "name email");

        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé." });
        }

        res.status(200).json({ 
            message: "Devis mis à jour avec succès.", 
            devis 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.deleteDevis = async (req, res) => {
    try {
        const devis = await Devis.findByIdAndDelete(req.params.id);

        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé." });
        }

        res.status(200).json({ message: "Devis supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.updateDevisStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "accepted", "rejected"].includes(status)) {
            return res.status(400).json({ 
                message: "Statut invalide. Les valeurs autorisées sont: pending, accepted, rejected" 
            });
        }

        const devis = await Devis.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("fournisseur", "name contactPerson email phone")
         .populate("createdBy", "name email");

        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé." });
        }

        res.status(200).json({ 
            message: "Statut du devis mis à jour avec succès.", 
            devis 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
}; 