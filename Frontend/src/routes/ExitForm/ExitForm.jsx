import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, FileText, Calendar, Edit2, Trash2, Download, Filter, X } from "lucide-react";

const ExitForm = () => {
  const [exitForms, setExitForms] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    date: "",
    fournisseur: "",
    equipment: "",
    document: null,
    status: "pending"
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedFormEquipment, setSelectedFormEquipment] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, fournRes] = await Promise.all([
          axios.get("http://localhost:5000/api/exit-forms"),
          axios.get("http://localhost:5000/api/fournisseurs")
        ]);

        setExitForms(formsRes.data);
        setFournisseurs(fournRes.data.fournisseurs);
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const handleRemoveEquipment = (index) => {
    setEquipment(equipment.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.reference) errors.reference = "Référence requise";
    if (!formData.date) errors.date = "Date requise";
    if (!formData.fournisseur) errors.fournisseur = "Fournisseur requis";
    if (equipment.length === 0) errors.equipment = "Au moins un équipement est requis";
    if (!formData.document && !selectedForm) errors.document = "Document requis";

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
      formDataToSend.append("equipment", JSON.stringify(equipment));
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      const response = await axios.post("http://localhost:5000/api/exit-forms", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const fournisseur = fournisseurs.find(f => f._id === formData.fournisseur);
      
      const newForm = {
        ...response.data,
        fournisseur: fournisseur
      };

      setExitForms([newForm, ...exitForms]);
      
      setFormData({
        reference: "",
        date: "",
        fournisseur: "",
        document: null,
        status: "pending"
      });
      setEquipment([]);
      setNewEquipment("");
    } catch (err) {
      console.error("Error creating exit form:", err);
      setError(err.response?.data?.error || "Erreur lors de la création de la fiche de sortie");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("reference", formData.reference);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("fournisseur", formData.fournisseur);
      formDataToSend.append("equipment", JSON.stringify(equipment));
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      await axios.put(
        `http://localhost:5000/api/exit-forms/${selectedForm._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const updatedForm = await axios.get(`http://localhost:5000/api/exit-forms/${selectedForm._id}`);

      setExitForms(exitForms.map(form => 
        form._id === selectedForm._id ? updatedForm.data : form
      ));
      setShowUpdateModal(false);
    } catch (err) {
      console.error("Error updating exit form:", err);
      setError(err.response?.data?.error || "Erreur lors de la mise à jour de la fiche de sortie");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/exit-forms/${selectedForm._id}`);
      setExitForms(exitForms.filter(form => form._id !== selectedForm._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Erreur lors de la suppression de la fiche de sortie");
    }
  };

  const openUpdateModal = (form) => {
    setSelectedForm(form);
    setFormData({
      reference: form.reference,
      date: form.date.split('T')[0],
      fournisseur: form.fournisseur._id,
      document: null,
      status: form.status
    });
    setEquipment(form.equipment || []);
    setFormErrors({});
    setShowUpdateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const filteredForms = exitForms.filter(form => (
    (!selectedFournisseur || form.fournisseur?._id === selectedFournisseur) &&
    (!selectedStatus || form.status === selectedStatus)
  ));

  const openEquipmentModal = (equipment) => {
    setSelectedFormEquipment(equipment);
    setShowEquipmentModal(true);
  };

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Fiches de Sortie</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les fiches de sortie des équipements
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
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ajouter une fiche de sortie</h2>
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Équipements {formErrors.equipment && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEquipment();
                  }
                }}
                placeholder="Ajouter un équipement"
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={18} />
              </motion.button>
            </div>
            {formErrors.equipment && (
              <p className="text-red-500 text-xs mt-1">{formErrors.equipment}</p>
            )}
            <div className="space-y-2">
              {equipment.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => handleRemoveEquipment(index)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document (PDF)
            </label>
            <input
              type="file"
              name="document"
              onChange={handleInputChange}
              accept=".pdf"
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtrer les fiches de sortie</h3>
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

      {/* Exit Forms Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {filteredForms.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucune fiche de sortie trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {["Référence", "Date", "Fournisseur", "Équipement", "PDF", "Statut", "Actions"].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredForms.map((form) => (
                    <motion.tr
                      key={form._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {form.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(form.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {form.fournisseur?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEquipmentModal(form.equipment)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40"
                        >
                          <FileText size={14} className="mr-1" />
                          Voir les équipements ({form.equipment.length})
                        </motion.button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {form.document ? (
                          <a
                            href={`http://localhost:5000${form.document}`}
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
                          form.status === "approved" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : form.status === "rejected"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {form.status === "approved" ? "Approuvé" : 
                           form.status === "rejected" ? "Rejeté" : "En attente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openUpdateModal(form)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedForm(form);
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

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Liste des équipements</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
              </motion.button>
            </div>
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Équipement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedFormEquipment.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Fermer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item={selectedForm?.reference}
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
        Êtes-vous sûr de vouloir supprimer la fiche de sortie "{item}" ?
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier la fiche de sortie</h3>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Équipements
          </label>
          <div className="space-y-2">
            {data.equipment.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => {
                    const newEquipment = data.equipment.filter((_, i) => i !== index);
                    onChange({ target: { name: "equipment", value: newEquipment } });
                  }}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document (PDF)
          </label>
          <input
            type="file"
            name="document"
            onChange={onChange}
            accept=".pdf"
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

export default ExitForm; 