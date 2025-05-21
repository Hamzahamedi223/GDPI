import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, AlertTriangle, FileText, Hash } from "lucide-react";

const AddReclamation = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reclamation, setReclamation] = useState({
    title: "",
    description: "",
    equipment: "",
    priority: "medium",
    type: "technical",
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
      if (!reclamation.title || !reclamation.description || !reclamation.equipment) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      await axios.post(
        `http://localhost:5000/api/reclamations/department/${department}`,
        reclamation,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/department/${department}/reclamations`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create reclamation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nouvelle Réclamation
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
              placeholder="Entrez le titre de la réclamation"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={reclamation.title}
              onChange={(e) =>
                setReclamation({ ...reclamation, title: e.target.value })
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
              placeholder="Décrivez le problème en détail"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={reclamation.description}
              onChange={(e) =>
                setReclamation({ ...reclamation, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="equipment"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Équipement <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="equipment"
                required
                placeholder="Nom de l'équipement concerné"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={reclamation.equipment}
                onChange={(e) =>
                  setReclamation({ ...reclamation, equipment: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={reclamation.type}
                onChange={(e) =>
                  setReclamation({ ...reclamation, type: e.target.value })
                }
              >
                <option value="technical">Technique</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Autre</option>
              </select>
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
              value={reclamation.priority}
                onChange={(e) =>
                  setReclamation({ ...reclamation, priority: e.target.value })
                }
            >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate(`/department/${department}/reclamations`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Création...
                </div>
              ) : (
                "Créer la réclamation"
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AddReclamation; 