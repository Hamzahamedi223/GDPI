import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, FileText, Calendar, Edit2, Trash2, Download, Filter, X } from "lucide-react";
import toast from "react-hot-toast";

const ExitForm = () => {
  const [exitForms, setExitForms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    date: "",
    description: "",
    equipment: [],
    document: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedFormEquipment, setSelectedFormEquipment] = useState([]);
  const [selectedFormDetails, setSelectedFormDetails] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showEquipmentSelectionModal, setShowEquipmentSelectionModal] = useState(false);
  const [isCreateForm, setIsCreateForm] = useState(false);
  const [previousEquipmentSelection, setPreviousEquipmentSelection] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsRes, equipmentRes] = await Promise.all([
          axios.get("http://localhost:5000/api/exit-forms"),
          axios.get("http://localhost:5000/api/equipment")
        ]);

        // Ensure equipment data is properly structured and populated
        const formattedForms = formsRes.data.map(form => ({
          ...form,
          equipment: Array.isArray(form.equipment) ? form.equipment.map(eq => ({
            ...eq,
            name: eq.name || 'N/A',
            description: eq.description || 'N/A',
            serial_number: eq.serial_number || 'N/A',
            status: eq.status || 'N/A',
            location: eq.location || 'N/A',
            category: eq.category || 'N/A'
          })) : []
        }));

        setExitForms(formattedForms);
        setEquipment(equipmentRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
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
    if (!formData.description) errors.description = "Description requise";
    if (formData.equipment.length === 0) errors.equipment = "Au moins un équipement est requis";
    if (!formData.document && !selectedForm) errors.document = "Document requis";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found; user not authorized.");
      setError("Erreur d'autorisation (token manquant)");
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("reference", formData.reference);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("equipment", JSON.stringify(formData.equipment));
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }
      const response = await axios.post("http://localhost:5000/api/exit-forms", formDataToSend, { headers: { "Content-Type": "multipart/form-data", Authorization: "Bearer " + token } });
      setExitForms([response.data, ...exitForms]);
      setFormData({ reference: "", date: "", description: "", equipment: [], document: null, status: "pending" });
      toast.success("Fiche de sortie créée avec succès");
    } catch (err) {
      console.error("Error creating exit form:", err);
      setError(err.response?.data?.error || "Erreur lors de la création de la fiche de sortie");
      toast.error(err.response?.data?.error || "Erreur lors de la création de la fiche de sortie");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found; user not authorized.");
      setError("Erreur d'autorisation (token manquant)");
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("reference", formData.reference);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("description", formData.description || '');
      formDataToSend.append("equipment", JSON.stringify(formData.equipment));
      formDataToSend.append("status", formData.status);
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }
      await axios.put("http://localhost:5000/api/exit-forms/" + selectedForm._id, formDataToSend, { headers: { "Content-Type": "multipart/form-data", Authorization: "Bearer " + token } });
      const updatedForm = await axios.get("http://localhost:5000/api/exit-forms/" + selectedForm._id, { headers: { Authorization: "Bearer " + token } });
      setExitForms(exitForms.map(form => (form._id === selectedForm._id ? updatedForm.data : form)));
      setShowUpdateModal(false);
      toast.success("Fiche de sortie mise à jour avec succès");
    } catch (err) {
      console.error("Error updating exit form:", err);
      setError(err.response?.data?.error || "Erreur lors de la mise à jour de la fiche de sortie");
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour de la fiche de sortie");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/exit-forms/${selectedForm._id}`);
      setExitForms(exitForms.filter(form => form._id !== selectedForm._id));
      setShowDeleteModal(false);
      toast.success("Fiche de sortie supprimée avec succès");
    } catch (err) {
      setError("Erreur lors de la suppression de la fiche de sortie");
      toast.error("Erreur lors de la suppression de la fiche de sortie");
    }
  };

  const openUpdateModal = (form) => {
    setSelectedForm(form);
    setFormData({
      reference: form.reference,
      date: form.date.split('T')[0],
      description: form.description || '',
      equipment: form.equipment.map(eq => eq._id),
      document: null,
      status: form.status
    });
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

  const handleEquipmentChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      equipment: selectedOptions
    }));
  };

  const filteredForms = exitForms;

  const openEquipmentModal = (form) => {
    setSelectedFormEquipment(form.equipment);
    setSelectedFormDetails({
      reference: form.reference,
      date: new Date(form.date).toLocaleDateString(),
      description: form.description
    });
    setShowEquipmentModal(true);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const openEquipmentSelection = (isCreate = false) => {
    setIsCreateForm(isCreate);
    if (isCreate) {
      setPreviousEquipmentSelection(formData.equipment);
    } else {
      setPreviousEquipmentSelection(formData.equipment);
    }
    setShowEquipmentSelectionModal(true);
  };

  const handleEquipmentSelect = (selectedEquipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: selectedEquipment
    }));
    setShowEquipmentSelectionModal(false);
  };

  const confirmEquipmentSelection = () => {
    if (formData.equipment.length > 0) {
      setShowEquipmentSelectionModal(false);
    } else {
      setFormErrors(prev => ({ ...prev, equipment: "Au moins un équipement est requis" }));
    }
  };

  const cancelEquipmentSelection = () => {
    setFormData(prev => ({ ...prev, equipment: previousEquipmentSelection }));
    setShowEquipmentSelectionModal(false);
  };

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Fiches de Sortie</h1>
        <p className="mt-1 text-sm text-gray-500">
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
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ajouter une fiche de sortie</h2>
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description {formErrors.description && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name="description"
              value={formData.description}
            onChange={handleInputChange}
              rows="3"
              className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                formErrors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Entrez la description de la fiche de sortie..."
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipements {formErrors.equipment && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div 
                onClick={() => openEquipmentSelection(true)}
                className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-500"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formData.equipment.length > 0 
                      ? `${formData.equipment.length} équipement(s) sélectionné(s)`
                      : "Sélectionner des équipements"}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors.equipment && (
              <p className="text-red-500 text-xs mt-1">{formErrors.equipment}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document (PDF)
            </label>
            <input
              type="file"
              name="document"
              onChange={handleInputChange}
              accept=".pdf"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Exit Forms Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {filteredForms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucune fiche de sortie trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Référence", "Date", "Équipement", "PDF", "Actions"].map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form) => (
                    <motion.tr
                      key={form._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {form.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(form.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEquipmentModal(form)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FileText size={14} className="mr-1" />
                          Voir les équipements ({Array.isArray(form.equipment) ? form.equipment.length : 0})
                        </motion.button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {form.document ? (
                          <a
                            href={`http://localhost:5000${form.document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openUpdateModal(form)}
                            className="text-blue-600 hover:text-blue-900"
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
                            className="text-red-600 hover:text-red-900"
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
            className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Détails de la fiche de sortie</h3>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimer
                </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEquipmentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </motion.button>
            </div>
            </div>

            {/* Form Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Référence</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedFormDetails?.reference}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedFormDetails?.date}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedFormDetails?.description}</p>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Liste des équipements</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro de série
                      </th>
                 
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedFormEquipment.map((eq) => (
                      <motion.tr
                        key={eq._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {eq.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {eq.serial_number}
                        </td>
                       
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Equipment Selection Modal */}
      {showEquipmentSelectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Sélectionner des équipements</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={cancelEquipmentSelection}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const allChecked = e.target.checked;
                            const allEquipmentIds = equipment.map(eq => eq._id);
                            handleEquipmentSelect(allChecked ? allEquipmentIds : []);
                          }}
                          checked={formData.equipment.length === equipment.length}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro de série
                      </th>
                 
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipment.map((eq) => (
                      <motion.tr
                        key={eq._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={formData.equipment.includes(eq._id)}
                            onChange={(e) => {
                              const newEquipment = e.target.checked
                                ? [...formData.equipment, eq._id]
                                : formData.equipment.filter(id => id !== eq._id);
                              handleEquipmentSelect(newEquipment);
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {eq.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {eq.serial_number}
                        </td>
                   
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={cancelEquipmentSelection}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmEquipmentSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .fixed, .fixed * {
              visibility: visible;
            }
            .fixed {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button {
              display: none !important;
            }
            .bg-gray-50 {
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact;
            }
            .bg-white {
              background-color: white !important;
              -webkit-print-color-adjust: exact;
            }
            .bg-green-100 {
              background-color: #d1fae5 !important;
              -webkit-print-color-adjust: exact;
            }
            .bg-yellow-100 {
              background-color: #fef3c7 !important;
              -webkit-print-color-adjust: exact;
            }
            .bg-red-100 {
              background-color: #fee2e2 !important;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

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
        equipment={equipment}
        onChange={handleInputChange}
        onEquipmentChange={handleEquipmentChange}
      />
    </div>
  );
};

const InputField = ({ label, name, value, onChange, error, type = "text", icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
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
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${icon ? "pl-10" : ""}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectInput = ({ label, value, onChange, options, labels, icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
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
      className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl"
    >
      <div className="flex items-center gap-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-full">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Êtes-vous sûr de vouloir supprimer la fiche de sortie "{item}" ?
      </p>
      <div className="flex justify-end gap-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, equipment, onChange, onEquipmentChange }) => isOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
    >
      <div className="flex items-center gap-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-full">
          <Edit2 className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Modifier la fiche de sortie</h3>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description {errors.description && <span className="text-red-500">*</span>}
          </label>
          <textarea
            name="description"
            value={data.description}
          onChange={onChange}
            rows="3"
            className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Entrez la description de la fiche de sortie..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Équipements {errors.equipment && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <div 
              onClick={() => openEquipmentSelection(false)}
              className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-500"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {data.equipment.length > 0 
                    ? `${data.equipment.length} équipement(s) sélectionné(s)`
                    : "Sélectionner des équipements"}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
          </div>
          </div>
          {errors.equipment && (
            <p className="text-red-500 text-xs mt-1">{errors.equipment}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document (PDF)
          </label>
          <input
            type="file"
            name="document"
            onChange={onChange}
            accept=".pdf"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {errors.document && (
            <p className="text-red-500 text-xs mt-1">{errors.document}</p>
          )}
        </div>
        <div className="flex justify-end gap-x-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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