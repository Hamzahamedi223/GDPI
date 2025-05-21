import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Plus, 
  AlertCircle, 
  Building, 
  Tag, 
  Calendar, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Truck 
} from "lucide-react";

const Equipments = () => {
  // State for equipment list and filters
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedWarranty, setSelectedWarranty] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form data states
  const [createFormData, setCreateFormData] = useState({
    name: "",
    categorie: "",
    model: "",
    status: "operational",
    serial_number: "",
    purchase_date: "",
    warranty_status: "valid",
    department: "",
    fournisseur: "",
    prix: "",
  });

  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    categorie: "",
    model: "",
    status: "operational",
    serial_number: "",
    purchase_date: "",
    warranty_status: "valid",
    department: "",
    fournisseur: "",
    prix: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipRes, deptRes, catRes, modelRes, fournRes] = await Promise.all([
        axios.get("http://localhost:5000/api/equipment"),
        axios.get("http://localhost:5000/api/departments"),
        axios.get("http://localhost:5000/api/categories"),
        axios.get("http://localhost:5000/api/models"),
        axios.get("http://localhost:5000/api/fournisseurs"),
      ]);

      setEquipments(equipRes.data);
      setDepartments(deptRes.data.departments);
      setCategories(catRes.data.categories);
      setModels(modelRes.data.models);
      setFournisseurs(fournRes.data.fournisseurs);
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = equipments.filter(equipment => {
      const matchesFilters = 
        (!selectedCategory || equipment.categorie?._id === selectedCategory) &&
        (!selectedModel || equipment.model?._id === selectedModel) &&
        (!selectedDepartment || equipment.department?._id === selectedDepartment) &&
        (!selectedStatus || equipment.status === selectedStatus) &&
        (!selectedWarranty || equipment.warranty_status === selectedWarranty) &&
        (!selectedFournisseur || equipment.fournisseur?._id === selectedFournisseur);

      const matchesSearch = 
        equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilters && matchesSearch;
    });
    setFilteredEquipments(filtered);
  }, [equipments, selectedCategory, selectedModel, selectedDepartment, selectedStatus, selectedWarranty, selectedFournisseur, searchTerm]);

  // Analysis calculations
  const totalPrice = filteredEquipments.reduce((sum, eq) => sum + (parseFloat(eq.prix) || 0), 0);
  const operationalCount = filteredEquipments.filter(eq => eq.status === "operational").length;
  const outOfServiceCount = filteredEquipments.filter(eq => eq.status === "down").length;
  const totalProducts = filteredEquipments.length;

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.department) errors.department = "Service requis";
    if (!formData.name?.trim()) errors.name = "Nom requis";
    if (!formData.categorie) errors.categorie = "Catégorie requise";
    if (!formData.serial_number?.trim()) errors.serial_number = "Numéro de série requis";
    if (!formData.purchase_date) errors.purchase_date = "Date d'achat requise";
    if (!formData.prix) {
      errors.prix = "Prix requis";
    } else if (isNaN(formData.prix)) {
      errors.prix = "Doit être un nombre valide";
    } else if (parseFloat(formData.prix) <= 0) {
      errors.prix = "Doit être supérieur à 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm(createFormData)) return;
    try {
      const response = await axios.post("http://localhost:5000/api/equipment", {
        ...createFormData,
        prix: parseFloat(createFormData.prix)
      });
      
      // Fetch the newly created equipment with populated fields
      const populatedResponse = await axios.get(`http://localhost:5000/api/equipment/${response.data._id}`);
      
      setEquipments([populatedResponse.data, ...equipments]);
      setShowCreateModal(false);
      setCreateFormData({
        name: "",
        categorie: "",
        model: "",
        status: "operational",
        serial_number: "",
        purchase_date: "",
        warranty_status: "valid",
        department: "",
        fournisseur: "",
        prix: "",
      });
    } catch (err) {
      setError("Erreur lors de l'ajout de l'équipement");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm(updateFormData)) return;
    try {
      const response = await axios.put(
        `http://localhost:5000/api/equipment/${selectedEquipment._id}`,
        { ...updateFormData, prix: parseFloat(updateFormData.prix) }
      );

      // Fetch the updated equipment with populated fields
      const populatedResponse = await axios.get(`http://localhost:5000/api/equipment/${response.data._id}`);

      setEquipments(equipments.map(eq =>
        eq._id === selectedEquipment._id ? populatedResponse.data : eq
      ));
      setShowUpdateModal(false);
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'équipement");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/equipment/${selectedEquipment._id}`);
      setEquipments(equipments.filter(eq => eq._id !== selectedEquipment._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Erreur lors de la suppression de l'équipement");
    }
  };

  const openUpdateModal = (equipment) => {
    setSelectedEquipment(equipment);
    setUpdateFormData({
      name: equipment.name,
      categorie: equipment.categorie?._id || "",
      model: equipment.model?._id || "",
      status: equipment.status,
      serial_number: equipment.serial_number,
      purchase_date: equipment.purchase_date?.split('T')[0] || "",
      warranty_status: equipment.warranty_status,
      department: equipment.department?._id || "",
      fournisseur: equipment.fournisseur?._id || "",
      prix: equipment.prix || "",
    });
    setFormErrors({});
    setShowUpdateModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Équipements</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez et suivez tous les équipements de l'hôpital
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Équipement
        </button>
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

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalPrice.toFixed(2)} TND</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
              <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Équipements Totals</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalProducts}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mr-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Opérationnels</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{operationalCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hors Service</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{outOfServiceCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <FilterSelect
            label="Catégorie"
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            icon={<Tag size={18} />}
          />

          <FilterSelect
            label="Modèle"
            options={models}
            value={selectedModel}
            onChange={setSelectedModel}
            icon={<Tag size={18} />}
          />

          <FilterSelect
            label="Service"
            options={departments}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            icon={<Building size={18} />}
          />

          <FilterSelect
            label="Statut"
            options={[
              { _id: "operational", name: "Opérationnel" },
              { _id: "down", name: "Hors service" }
            ]}
            value={selectedStatus}
            onChange={setSelectedStatus}
            icon={<CheckCircle size={18} />}
          />

          <FilterSelect
            label="Garantie"
            options={[
              { _id: "valid", name: "Valid" },
              { _id: "expired", name: "Expired" }
            ]}
            value={selectedWarranty}
            onChange={setSelectedWarranty}
            icon={<Shield size={18} />}
          />

          <FilterSelect
            label="Fournisseur"
            options={fournisseurs}
            value={selectedFournisseur}
            onChange={setSelectedFournisseur}
            icon={<Truck size={18} />}
          />
        </div>
      </motion.div>

      {/* Equipment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Série</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEquipments.map((equipment) => (
                <tr key={equipment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{equipment.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{equipment.categorie?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{equipment.model?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{equipment.serial_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{equipment.department?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      equipment.status === 'operational' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {equipment.status === 'operational' ? 'Opérationnel' : 'Hors service'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{equipment.prix} TND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openUpdateModal(equipment)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEquipment(equipment);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          formData={createFormData}
          setFormData={setCreateFormData}
          errors={formErrors}
          categories={categories}
          models={models}
          departments={departments}
          fournisseurs={fournisseurs}
        />
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <UpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onSave={handleUpdate}
          formData={updateFormData}
          setFormData={setUpdateFormData}
          errors={formErrors}
          categories={categories}
          models={models}
          departments={departments}
          fournisseurs={fournisseurs}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          equipmentName={selectedEquipment?.name}
        />
      )}
    </div>
  );
};

// Reusable Components
const FilterSelect = ({ label, options, value, onChange, icon }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          icon ? 'pl-10' : 'pl-4'
        }`}
      >
        <option value="">Tous</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const CreateModal = ({ isOpen, onClose, onSave, formData, setFormData, errors, categories, models, departments, fournisseurs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full shadow-xl"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nouvel Équipement</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nom"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              icon={<Tag size={18} />}
              required
            />

            <SelectField
              label="Catégorie"
              name="categorie"
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              options={categories}
              error={errors.categorie}
              icon={<Tag size={18} />}
              required
            />

            <SelectField
              label="Modèle"
              name="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              options={models}
              error={errors.model}
              icon={<Tag size={18} />}
            />

            <InputField
              label="Numéro de série"
              name="serial_number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              error={errors.serial_number}
              icon={<Tag size={18} />}
              required
            />

            <InputField
              label="Date d'achat"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              error={errors.purchase_date}
              icon={<Calendar size={18} />}
              required
            />

            <InputField
              label="Prix"
              name="prix"
              type="number"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              error={errors.prix}
              icon={<DollarSign size={18} />}
              required
            />

            <SelectField
              label="Statut"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { _id: "operational", name: "Opérationnel" },
                { _id: "down", name: "Hors service" }
              ]}
              error={errors.status}
              icon={<CheckCircle size={18} />}
            />

            <SelectField
              label="Statut de garantie"
              name="warranty_status"
              value={formData.warranty_status}
              onChange={(e) => setFormData({ ...formData, warranty_status: e.target.value })}
              options={[
                { _id: "valid", name: "Valid" },
                { _id: "expired", name: "Expired" }
              ]}
              error={errors.warranty_status}
              icon={<Shield size={18} />}
            />

            <SelectField
              label="Service"
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments}
              error={errors.department}
              icon={<Building size={18} />}
              required
            />

            <SelectField
              label="Fournisseur"
              name="fournisseur"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              options={fournisseurs}
              error={errors.fournisseur}
              icon={<Truck size={18} />}
            />
          </div>

          <div className="flex justify-end gap-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UpdateModal = ({ isOpen, onClose, onSave, formData, setFormData, errors, categories, models, departments, fournisseurs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full shadow-xl"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Modifier l'Équipement</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nom"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              icon={<Tag size={18} />}
              required
            />

            <SelectField
              label="Catégorie"
              name="categorie"
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              options={categories}
              error={errors.categorie}
              icon={<Tag size={18} />}
              required
            />

            <SelectField
              label="Modèle"
              name="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              options={models}
              error={errors.model}
              icon={<Tag size={18} />}
            />

            <InputField
              label="Numéro de série"
              name="serial_number"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              error={errors.serial_number}
              icon={<Tag size={18} />}
              required
            />

            <InputField
              label="Date d'achat"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              error={errors.purchase_date}
              icon={<Calendar size={18} />}
              required
            />

            <InputField
              label="Prix"
              name="prix"
              type="number"
              value={formData.prix}
              onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
              error={errors.prix}
              icon={<DollarSign size={18} />}
              required
            />

            <SelectField
              label="Statut"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { _id: "operational", name: "Opérationnel" },
                { _id: "down", name: "Hors service" }
              ]}
              error={errors.status}
              icon={<CheckCircle size={18} />}
            />

            <SelectField
              label="Statut de garantie"
              name="warranty_status"
              value={formData.warranty_status}
              onChange={(e) => setFormData({ ...formData, warranty_status: e.target.value })}
              options={[
                { _id: "valid", name: "Valid" },
                { _id: "expired", name: "Expired" }
              ]}
              error={errors.warranty_status}
              icon={<Shield size={18} />}
            />

            <SelectField
              label="Service"
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departments}
              error={errors.department}
              icon={<Building size={18} />}
              required
            />

            <SelectField
              label="Fournisseur"
              name="fournisseur"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              options={fournisseurs}
              error={errors.fournisseur}
              icon={<Truck size={18} />}
            />
          </div>

          <div className="flex justify-end gap-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, equipmentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirmer la suppression</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer l'équipement "{equipmentName}" ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({ label, name, value, error, type = "text", onChange, icon, required = false, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
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
        className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

const SelectField = ({ label, name, value, options, error, onChange, icon, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
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
        className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      >
        <option value="">Sélectionner...</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

export default Equipments;
