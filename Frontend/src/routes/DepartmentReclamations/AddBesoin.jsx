import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Package, Hash } from "lucide-react";
import toast from "react-hot-toast";

const AddBesoin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [besoin, setBesoin] = useState({
    title: "",
    description: "",
    quantity: "",
    priority: "medium",
  });
  const navigate = useNavigate();
  const { department } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate form
      if (!besoin.title || !besoin.description || !besoin.quantity) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (isNaN(besoin.quantity) || parseInt(besoin.quantity) <= 0) {
        throw new Error("La quantité doit être un nombre positif");
      }

      await axios.post(
        `http://localhost:5000/api/besoins/department/${department}`,
        {
          ...besoin,
          quantity: parseInt(besoin.quantity)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Besoin créé avec succès");
      navigate(`/department/${department}/besoins`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create besoin");
      toast.error(err.response?.data?.message || err.message || "Erreur lors de la création du besoin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nouveau Besoin
          </h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              placeholder="Entrez le titre du besoin"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={besoin.title}
              onChange={(e) =>
                setBesoin({ ...besoin, title: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              placeholder="Décrivez le besoin en détail"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={besoin.description}
              onChange={(e) =>
                setBesoin({ ...besoin, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Quantité <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="quantity"
                required
                min="1"
                placeholder="Nombre d'unités"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={besoin.quantity}
                onChange={(e) =>
                  setBesoin({ ...besoin, quantity: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Priorité <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={besoin.priority}
              onChange={(e) =>
                setBesoin({ ...besoin, priority: e.target.value })
              }
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate(`/department/${department}/besoins`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Création...
                </div>
              ) : (
                "Créer le besoin"
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddBesoin; 