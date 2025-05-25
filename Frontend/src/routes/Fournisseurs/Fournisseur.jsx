import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Truck, Edit2, Trash2, Mail, Phone, MapPin, Building, FileText, DollarSign, Eye } from "lucide-react";
import toast from "react-hot-toast";

const Fournisseur = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
      country: ""
    },
    taxId: "",
    status: "active",
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/fournisseurs");
      setFournisseurs(response.data.fournisseurs);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement des fournisseurs.");
      toast.error(err.response?.data?.message || "Erreur lors du chargement des fournisseurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Le nom est requis";
    if (!formData.contactPerson) errors.contactPerson = "Le contact est requis";
    if (!formData.email) errors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Format d'email invalide";
    if (!formData.phone) errors.phone = "Le téléphone est requis";
    if (!formData.address.street) errors["address.street"] = "L'adresse est requise";
    if (!formData.address.city) errors["address.city"] = "La ville est requise";
    if (!formData.address.postalCode) errors["address.postalCode"] = "Le code postal est requis";
    if (!formData.address.country) errors["address.country"] = "Le pays est requis";
    if (!formData.taxId) errors.taxId = "Le numéro de TVA est requis";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/fournisseurs/${selectedFournisseur._id}`);
      setFournisseurs(fournisseurs.filter((f) => f._id !== selectedFournisseur._id));
      setShowDeleteModal(false);
      setSelectedFournisseur(null);
      toast.success("Fournisseur supprimé avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
      toast.error(err.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/fournisseurs/${selectedFournisseur._id}`,
        formData
      );
      setFournisseurs(fournisseurs.map(f => 
        f._id === selectedFournisseur._id ? response.data.fournisseur : f
      ));
      setShowUpdateModal(false);
      setSelectedFournisseur(null);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          postalCode: "",
          country: ""
        },
        taxId: "",
        status: "active",
        notes: ""
      });
      toast.success("Fournisseur mis à jour avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.");
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const response = await axios.post("http://localhost:5000/api/fournisseurs", formData);
      setFournisseurs([response.data.fournisseur, ...fournisseurs]);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          postalCode: "",
          country: ""
        },
        taxId: "",
        status: "active",
        notes: ""
      });
      toast.success("Fournisseur créé avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création.");
      toast.error(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const ViewModal = ({ isOpen, onClose, fournisseur }) => isOpen && (
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
              <h3 className="text-xl font-semibold text-gray-900">Détails du Fournisseur</h3>
              <p className="mt-1 text-sm text-gray-500">Informations complètes</p>
            </div>
      </div>
          <button
            onClick={onClose}
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
                <p className="text-sm font-medium text-gray-500">Nom</p>
                <p className="mt-1 text-sm text-gray-900">{fournisseur.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="mt-1 text-sm text-gray-900">{fournisseur.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{fournisseur.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="mt-1 text-sm text-gray-900">{fournisseur.phone}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Adresse</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {fournisseur.address ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{fournisseur.address.street}</p>
                  <p className="text-sm text-gray-900">
                    {fournisseur.address.postalCode} {fournisseur.address.city}
                  </p>
                  <p className="text-sm text-gray-900">{fournisseur.address.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Adresse non spécifiée</p>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Informations professionnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Numéro de TVA</p>
                <p className="mt-1 text-sm text-gray-900">{fournisseur.taxId || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span className={`mt-1 inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                  fournisseur.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {fournisseur.status === "active" ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {fournisseur.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Notes</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">{fournisseur.notes}</p>
              </div>
        </div>
      )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
          </div>
        </motion.div>
    </div>
  );

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Fournisseurs</h1>

        {/* Create Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="col-span-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter un fournisseur</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Truck size={18} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nom du fournisseur"
              />
            </div>
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contact</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText size={18} />
              </div>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Personne à contacter"
              />
            </div>
            {formErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{formErrors.contactPerson}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="email@exemple.com"
              />
            </div>
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Numéro de téléphone"
              />
            </div>
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Rue"
              />
            </div>
            {formErrors["address.street"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.street"]}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ville</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Building size={18} />
              </div>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ville"
              />
            </div>
            {formErrors["address.city"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.city"]}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Code Postal</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Code postal"
              />
            </div>
            {formErrors["address.postalCode"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.postalCode"]}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pays</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Pays"
              />
            </div>
            {formErrors["address.country"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.country"]}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Numéro de TVA</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText size={18} />
              </div>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Numéro de TVA"
              />
            </div>
            {formErrors.taxId && <p className="text-red-500 text-xs mt-1">{formErrors.taxId}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <div className="space-y-2">
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
              <span>{isCreating ? "Création..." : "Créer le fournisseur"}</span>
          </motion.button>
          </div>
        </div>

        {/* Suppliers List */}
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {fournisseurs.map((fournisseur) => (
                <tr key={fournisseur._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fournisseur.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fournisseur.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fournisseur.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fournisseur.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fournisseur.address ? 
                      `${fournisseur.address.street || ''}, ${fournisseur.address.city || ''} ${fournisseur.address.postalCode || ''}, ${fournisseur.address.country || ''}` :
                      'Adresse non spécifiée'
                    }
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fournisseur.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {fournisseur.status === "active" ? "Actif" : "Inactif"}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedFournisseur(fournisseur);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                          onClick={() => {
                          setSelectedFournisseur(fournisseur);
                          setFormData(fournisseur);
                            setShowUpdateModal(true);
                          }}
                        className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 size={18} />
                      </button>
                      <button
                          onClick={() => {
                          setSelectedFournisseur(fournisseur);
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

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Modifier le fournisseur</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{formErrors.contactPerson}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors["address.street"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.street"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors["address.city"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.city"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Code Postal</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors["address.postalCode"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.postalCode"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pays</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors["address.country"] && <p className="text-red-500 text-xs mt-1">{formErrors["address.country"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Numéro de TVA</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {formErrors.taxId && <p className="text-red-500 text-xs mt-1">{formErrors.taxId}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div className="space-y-2">
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
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Supprimer le fournisseur</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
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

      {/* View Modal */}
      {showViewModal && selectedFournisseur && (
        <ViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          fournisseur={selectedFournisseur}
        />
      )}
    </div>
  );
};

export default Fournisseur;