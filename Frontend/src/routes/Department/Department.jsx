import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Building, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [newName, setNewName] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/departments");
      setDepartments(response.data.departments);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des Services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/departments/${selectedDept._id}`);
      setDepartments(departments.filter((dept) => dept._id !== selectedDept._id));
      setShowDeleteModal(false);
      setSelectedDept(null);
      toast.success("Service supprimé avec succès");
    } catch (err) {
      setError("Erreur lors de la suppression du Service.");
      toast.error(err.response?.data?.message || "Erreur lors de la suppression du Service.");
    }
  };

  const handleUpdate = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError("Le nom du Service ne peut pas être vide.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/departments/${selectedDept._id}`, {
        name: trimmedName,
      });
      setDepartments(
        departments.map((dept) =>
          dept._id === selectedDept._id ? { ...dept, name: trimmedName } : dept
        )
      );
      setShowUpdateModal(false);
      setSelectedDept(null);
      setNewName("");
      setError("");
      toast.success("Service mis à jour avec succès");
    } catch (err) {
      setError("Erreur lors de la mise à jour du Service.");
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du Service.");
    }
  };

  const handleCreate = async () => {
    const trimmedName = newDepartment.trim();
    if (!trimmedName) {
      setError("Le nom du Service ne peut pas être vide.");
      return;
    }

    const alreadyExists = departments.some((dept) =>
      dept.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      setError("Ce Service existe déjà.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/departments", {
        name: trimmedName,
      });
      setDepartments([...departments, response.data.department]);
      setNewDepartment("");
      setError("");
      toast.success("Service créé avec succès");
    } catch (err) {
      setError("Erreur lors de la création du Service.");
      toast.error(err.response?.data?.message || "Erreur lors de la création du Service.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Services</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les Services de l'hôpital
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

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

      {/* Create Department */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <div className="flex items-end gap-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nouveau Service
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Building size={18} />
              </div>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                placeholder="Entrez le nom du Service"
                value={newDepartment}
                onChange={(e) => {
                  setNewDepartment(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={18} />
            <span>Ajouter</span>
          </motion.button>
        </div>
      </motion.div>

      {!loading && departments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <Building className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-blue-700">Aucun Service trouvé</p>
          </div>
        </motion.div>
      )}

      {!loading && departments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {departments.map((dept) => (
                  <motion.tr
                    key={dept._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dept.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setShowUpdateModal(true);
                            setSelectedDept(dept);
                            setNewName(dept.name);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setShowDeleteModal(true);
                            setSelectedDept(dept);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
          >
            <div className="flex items-center gap-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer le Service "{selectedDept?.name}" ?
            </p>
            <div className="flex justify-end gap-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDept(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Supprimer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier le Service</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Building size={18} />
                  </div>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedDept(null);
                    setNewName("");
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Enregistrer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Department;
