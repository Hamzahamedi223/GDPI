import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, FileText, Calendar, Edit2, Trash2, Download, Filter } from "lucide-react";
import toast from "react-hot-toast";

const PurchaseOrder = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    date: "",
    fournisseur: "",
    details: "",
    document: null,
    status: "pending"
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, fournRes] = await Promise.all([
          axios.get("http://localhost:5000/api/purchase-orders"),
          axios.get("http://localhost:5000/api/fournisseurs")
        ]);

        setPurchaseOrders(ordersRes.data);
        setFournisseurs(fournRes.data.fournisseurs);
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.reference) errors.reference = "Référence requise";
    if (!formData.date) errors.date = "Date requise";
    if (!formData.fournisseur) errors.fournisseur = "Fournisseur requis";
    if (!formData.details) errors.details = "Détails requis";
    if (!selectedOrder && !formData.document) errors.document = "Document requis";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("reference", formData.reference);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("fournisseur", formData.fournisseur);
      formDataToSend.append("details", formData.details);
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      const response = await axios.post("http://localhost:5000/api/purchase-orders", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Get the fournisseur details for the new order
      const fournisseur = fournisseurs.find(f => f._id === formData.fournisseur);
      
      // Create a new order object with populated fournisseur
      const newOrder = {
        ...response.data,
        fournisseur: fournisseur
      };

      // Update the state with the new order
      setPurchaseOrders([newOrder, ...purchaseOrders]);
      
      // Reset the form
      setFormData({
        reference: "",
        date: "",
        fournisseur: "",
        details: "",
        document: null,
        status: "pending"
      });

      toast.success("Bon de commande créé avec succès");
    } catch (err) {
      console.error("Error creating purchase order:", err);
      setError(err.response?.data?.error || "Erreur lors de la création du bon de commande");
      toast.error(err.response?.data?.error || "Erreur lors de la création du bon de commande");
    }
  };

  const handleUpdate = async () => {
    console.log("Starting update process...");
    console.log("Form data:", formData);
    console.log("Selected order:", selectedOrder);
    
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("reference", formData.reference);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("fournisseur", formData.fournisseur);
      formDataToSend.append("details", formData.details);
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      console.log("Sending update request...");
      await axios.put(
        `http://localhost:5000/api/purchase-orders/${selectedOrder._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Update successful, fetching updated order...");
      // Fetch the updated purchase order with populated fournisseur
      const updatedOrder = await axios.get(`http://localhost:5000/api/purchase-orders/${selectedOrder._id}`);

      setPurchaseOrders(purchaseOrders.map(order => 
        order._id === selectedOrder._id ? updatedOrder.data : order
      ));
      setShowUpdateModal(false);

      toast.success("Bon de commande mis à jour avec succès");
    } catch (err) {
      console.error("Error updating purchase order:", err);
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du bon de commande");
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour du bon de commande");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/purchase-orders/${selectedOrder._id}`);
      setPurchaseOrders(purchaseOrders.filter(order => order._id !== selectedOrder._id));
      setShowDeleteModal(false);

      toast.success("Bon de commande supprimé avec succès");
    } catch (err) {
      setError("Erreur lors de la suppression du bon de commande");
      toast.error("Erreur lors de la suppression du bon de commande");
    }
  };

  const openUpdateModal = (order) => {
    console.log("Opening update modal for order:", order);
    setSelectedOrder(order);
    setFormData({
      reference: order.reference,
      date: order.date.split('T')[0],
      fournisseur: order.fournisseur._id,
      details: order.details,
      document: null,
      status: order.status
    });
    setFormErrors({});
    setShowUpdateModal(true);
    console.log("Update modal should now be open");
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const filteredOrders = purchaseOrders.filter(order => (
    (!selectedFournisseur || order.fournisseur?._id === selectedFournisseur) &&
    (!selectedStatus || order.status === selectedStatus)
  ));

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Bons de Commande</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les bons de commande des fournisseurs
        </p>
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

      {/* Create Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ajouter un bon de commande</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Référence"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            error={formErrors.reference}
            icon={<FileText size={18} />}
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            error={formErrors.date}
            icon={<Calendar size={18} />}
          />
          <SelectField
            label="Fournisseur"
            name="fournisseur"
            value={formData.fournisseur}
            options={fournisseurs}
            onChange={handleInputChange}
            error={formErrors.fournisseur}
            icon={<FileText size={18} />}
          />
          <InputField
            label="Détails"
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            error={formErrors.details}
            icon={<FileText size={18} />}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document (PDF ou Word)
            </label>
            <input
              type="file"
              name="document"
              onChange={handleInputChange}
              accept=".pdf,.doc,.docx"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
            />
            {formErrors.document && (
              <p className="text-red-500 text-xs mt-1">{formErrors.document}</p>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="mt-4 flex items-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          <span>Ajouter</span>
        </motion.button>
      </motion.form>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtrer les bons de commande</h3>
          <div className="flex items-center gap-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filtres</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fournisseur
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FileText size={18} />
              </div>
              <select
                value={selectedFournisseur}
                onChange={(e) => setSelectedFournisseur(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Tous les fournisseurs</option>
                {fournisseurs.map(opt => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SelectInput
            label="Statut"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={["", "pending", "approved", "rejected"]}
            labels={["Tous", "En attente", "Approuvé", "Rejeté"]}
            icon={<FileText size={18} />}
          />
        </div>
      </motion.div>

      {/* Purchase Orders Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {filteredOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun bon de commande trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {["Référence", "Date", "Fournisseur", "Détails", "PDF", "Statut", "Actions"].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.fournisseur?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.document ? (
                          <a
                            href={`http://localhost:5000${order.document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "approved" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : order.status === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {order.status === "approved" ? "Approuvé" : 
                           order.status === "rejected" ? "Rejeté" : "En attente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openUpdateModal(order)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteModal(true);
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
          )}
        </motion.div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item={selectedOrder?.reference}
      />

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleUpdate}
        data={formData}
        errors={formErrors}
        fournisseurs={fournisseurs}
        onChange={handleInputChange}
      />
    </div>
  );
};

const InputField = ({ label, name, value, onChange, error, type = "text", icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${icon ? "pl-10" : ""}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, options, onChange, error, icon, placeholder = "Sélectionner..." }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${icon ? "pl-10" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt._id} value={opt._id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectInput = ({ label, value, onChange, options, labels, icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
          icon ? "pl-10" : ""
        }`}
      >
        {options.map((opt, index) => (
          <option key={opt} value={opt}>{labels[index]}</option>
        ))}
      </select>
    </div>
  </div>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, item }) => isOpen && (
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
        Êtes-vous sûr de vouloir supprimer le bon de commande "{item}" ?
      </p>
      <div className="flex justify-end gap-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
        >
          Annuler
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Supprimer
        </motion.button>
      </div>
    </motion.div>
  </div>
);

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, fournisseurs, onChange }) => isOpen && (
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier le bon de commande</h3>
      </div>
      <div className="space-y-4">
        <InputField
          label="Référence"
          name="reference"
          value={data.reference}
          onChange={onChange}
          error={errors.reference}
          icon={<FileText size={18} />}
        />
        <InputField
          label="Date"
          name="date"
          type="date"
          value={data.date}
          onChange={onChange}
          error={errors.date}
          icon={<Calendar size={18} />}
        />
        <SelectField
          label="Fournisseur"
          name="fournisseur"
          value={data.fournisseur}
          options={fournisseurs}
          onChange={onChange}
          error={errors.fournisseur}
          icon={<FileText size={18} />}
        />
        <InputField
          label="Détails"
          name="details"
          value={data.details}
          onChange={onChange}
          error={errors.details}
          icon={<FileText size={18} />}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document (PDF ou Word)
          </label>
          <input
            type="file"
            name="document"
            onChange={onChange}
            accept=".pdf,.doc,.docx"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
          />
          {errors.document && (
            <p className="text-red-500 text-xs mt-1">{errors.document}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statut
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FileText size={18} />
            </div>
            <select
              name="status"
              value={data.status}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-x-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Enregistrer
          </motion.button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default PurchaseOrder; 