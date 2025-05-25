import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, FileText, Edit2, Trash2, Eye, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const Devis = () => {
  const [devis, setDevis] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    reference: "",
    date: new Date().toISOString().split('T')[0],
    fournisseur: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    validUntil: "",
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDevis();
    fetchFournisseurs();
  }, []);

  const fetchDevis = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get("http://localhost:5000/api/devis", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDevis(response.data.devis);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des devis.");
      toast.error(err.response?.data?.message || "Erreur lors du chargement des devis.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get("http://localhost:5000/api/fournisseurs", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setFournisseurs(response.data.fournisseurs);
    } catch (err) {
      toast.error("Erreur lors du chargement des fournisseurs.");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.reference) errors.reference = "La référence est requise";
    if (!formData.date) errors.date = "La date est requise";
    if (!formData.fournisseur) errors.fournisseur = "Le fournisseur est requis";
    if (!formData.validUntil) errors.validUntil = "La date de validité est requise";
    
    formData.items.forEach((item, index) => {
      if (!item.description) errors[`items.${index}.description`] = "La description est requise";
      if (!item.quantity || item.quantity < 1) errors[`items.${index}.quantity`] = "La quantité doit être supérieure à 0";
      if (!item.unitPrice || item.unitPrice < 0) errors[`items.${index}.unitPrice`] = "Le prix unitaire doit être positif";
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    // Clear error when user starts typing
    if (formErrors[`items.${index}.${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`items.${index}.${field}`]: ""
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post("http://localhost:5000/api/devis", formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDevis([response.data.devis, ...devis]);
      setFormData({
        reference: "",
        date: new Date().toISOString().split('T')[0],
        fournisseur: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        validUntil: "",
        notes: ""
      });
      toast.success("Devis créé avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création.");
      toast.error(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`http://localhost:5000/api/devis/${selectedDevis._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDevis(devis.filter((d) => d._id !== selectedDevis._id));
      setShowDeleteModal(false);
      setSelectedDevis(null);
      toast.success("Devis supprimé avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
      toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(`http://localhost:5000/api/devis/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDevis(devis.map(d => d._id === id ? response.data.devis : d));
      toast.success("Statut du devis mis à jour avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Devis</h1>

        {/* Create Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="col-span-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Créer un nouveau devis</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Référence</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText size={18} />
              </div>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Référence du devis"
              />
            </div>
            {formErrors.reference && <p className="text-red-500 text-xs mt-1">{formErrors.reference}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
            <select
              name="fournisseur"
              value={formData.fournisseur}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sélectionner un fournisseur</option>
              {fournisseurs.map(fournisseur => (
                <option key={fournisseur._id} value={fournisseur._id}>
                  {fournisseur.name}
                </option>
              ))}
            </select>
            {formErrors.fournisseur && <p className="text-red-500 text-xs mt-1">{formErrors.fournisseur}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date de validité</label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {formErrors.validUntil && <p className="text-red-500 text-xs mt-1">{formErrors.validUntil}</p>}
          </div>

          <div className="col-span-full">
            <h3 className="text-md font-medium text-gray-900 mb-4">Articles</h3>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Description de l'article"
                  />
                  {formErrors[`items.${index}.description`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`items.${index}.description`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                    min="1"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {formErrors[`items.${index}.quantity`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`items.${index}.quantity`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Prix unitaire</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {formErrors[`items.${index}.unitPrice`] && (
                    <p className="text-red-500 text-xs mt-1">{formErrors[`items.${index}.unitPrice`]}</p>
                  )}
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-blue-600 hover:text-blue-900 flex items-center gap-x-2"
            >
              <Plus size={18} />
              <span>Ajouter un article</span>
            </button>
          </div>

          <div className="col-span-full space-y-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Notes additionnelles"
              rows="3"
            />
          </div>

          <div className="col-span-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Plus size={18} />
              <span>{isCreating ? "Création..." : "Créer le devis"}</span>
            </motion.button>
          </div>
        </div>

        {/* Devis List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {devis.map((devis) => (
                <tr key={devis._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{devis.reference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(devis.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {devis.fournisseur.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {devis.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(devis.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      devis.status === "accepted" ? "bg-green-100 text-green-800" :
                      devis.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {devis.status === "accepted" ? "Accepté" :
                       devis.status === "rejected" ? "Rejeté" :
                       "En attente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDevis(devis);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      {devis.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(devis._id, "accepted")}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(devis._id, "rejected")}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDevis(devis);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Modal */}
      {showViewModal && selectedDevis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Détails du Devis</h3>
                  <p className="mt-1 text-sm text-gray-500">Référence: {selectedDevis.reference}</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Informations de base</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedDevis.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de validité</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedDevis.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <span className={`mt-1 inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                      selectedDevis.status === "accepted" ? "bg-green-100 text-green-800" :
                      selectedDevis.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedDevis.status === "accepted" ? "Accepté" :
                       selectedDevis.status === "rejected" ? "Rejeté" :
                       "En attente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Fournisseur</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">{selectedDevis.fournisseur.name}</p>
                    <p className="text-sm text-gray-900">{selectedDevis.fournisseur.contactPerson}</p>
                    <p className="text-sm text-gray-900">{selectedDevis.fournisseur.email}</p>
                    <p className="text-sm text-gray-900">{selectedDevis.fournisseur.phone}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Articles</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantité</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Prix unitaire</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDevis.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          Total
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {selectedDevis.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedDevis.notes && (
    <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedDevis.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Supprimer le devis</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devis;
