import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Building, Tag, Calendar, DollarSign, Shield, CheckCircle, XCircle, Search, Filter, Edit2, Trash2, Truck } from "lucide-react";

const Products = () => {
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

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedEquipment, setUpdatedEquipment] = useState({
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
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
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
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = equipments.filter(equipment => (
      (!selectedCategory || equipment.categorie?._id === selectedCategory) &&
      (!selectedModel || equipment.model?._id === selectedModel) &&
      (!selectedDepartment || equipment.department?._id === selectedDepartment) &&
      (!selectedStatus || equipment.status === selectedStatus) &&
      (!selectedWarranty || equipment.warranty_status === selectedWarranty) &&
      (!selectedFournisseur || equipment.fournisseur?._id === selectedFournisseur)
    ));
    setFilteredEquipments(filtered);
  }, [equipments, selectedCategory, selectedModel, selectedDepartment, selectedStatus, selectedWarranty, selectedFournisseur]);

  // Analysis calculations
  const totalPrice = filteredEquipments.reduce((sum, eq) => sum + (parseFloat(eq.prix) || 0), 0);
  const operationalCount = filteredEquipments.filter(eq => eq.status === "operational").length;
  const outOfServiceCount = filteredEquipments.filter(eq => eq.status === "down").length;
  const totalProducts = filteredEquipments.length;

  const validateForm = () => {
    const errors = {};
    if (!updatedEquipment.department) errors.department = "Service requis";
    if (!updatedEquipment.name.trim()) errors.name = "Nom requis";
    if (!updatedEquipment.categorie) errors.categorie = "Catégorie requise";
    if (!updatedEquipment.serial_number.trim()) errors.serial_number = "Numéro de série requis";
    if (!updatedEquipment.purchase_date) errors.purchase_date = "Date d'achat requise";
    if (!updatedEquipment.prix) {
      errors.prix = "Prix requis";
    } else if (isNaN(updatedEquipment.prix)) {
      errors.prix = "Doit être un nombre valide";
    } else if (parseFloat(updatedEquipment.prix) <= 0) {
      errors.prix = "Doit être supérieur à 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/${selectedEquipment._id}`,
        { ...updatedEquipment, prix: parseFloat(updatedEquipment.prix) }
      );

      setEquipments(equipments.map(eq =>
        eq._id === selectedEquipment._id ? {
          ...eq,
          ...updatedEquipment,
          categorie: categories.find(cat => cat._id === updatedEquipment.categorie),
          model: models.find(mod => mod._id === updatedEquipment.model),
          department: departments.find(dept => dept._id === updatedEquipment.department),
          fournisseur: fournisseurs.find(fourn => fourn._id === updatedEquipment.fournisseur)
        } : eq
      ));
      setShowUpdateModal(false);
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'équipement");
    }
  };

  const openUpdateModal = (equipment) => {
    setSelectedEquipment(equipment);
    setUpdatedEquipment({
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setUpdatedEquipment(prev => {
      const newState = { ...prev, [name]: value };
      console.log('New state:', newState); // Debug log
      return newState;
    });
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Équipements</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez et suivez tous les équipements de l'hôpital
        </p>
      </div>

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtrer les équipements</h3>
          <div className="flex items-center gap-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filtres</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            label="Fournisseur"
            options={fournisseurs}
            value={selectedFournisseur}
            onChange={setSelectedFournisseur}
            icon={<Truck size={18} />}
          />
          <SelectInput
            label="Statut"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={["", "operational", "down"]}
            labels={["Tous", "Opérationnel", "Hors service"]}
            icon={<CheckCircle size={18} />}
          />
          <SelectInput
            label="Garantie"
            value={selectedWarranty}
            onChange={setSelectedWarranty}
            options={["", "valid", "expired"]}
            labels={["Tous", "Valide", "Expirée"]}
            icon={<Shield size={18} />}
          />
        </div>
      </motion.div>

      {/* Loading & Error States */}
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

      {/* Equipment Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {filteredEquipments.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun équipement trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {["Nom", "Catégorie", "Modèle", "Department", "Fournisseur", "Garantie", "Date d'achat",
                      "N°Série", "Prix (TND)", "Statut", "Actions"].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEquipments.map((equipment) => (
                    <motion.tr
                      key={equipment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {equipment.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.categorie?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.model?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.department?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.fournisseur?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.warranty_status || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(equipment.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.serial_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {equipment.prix ? `${parseFloat(equipment.prix).toFixed(2)}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${equipment.status === "operational"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                          {equipment.status === "operational" ? "Opérationnel" : "Hors service"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openUpdateModal(equipment)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedEquipment(equipment);
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
        equipmentName={selectedEquipment?.name}
      />

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleUpdate}
        equipment={updatedEquipment}
        errors={formErrors}
        categories={categories}
        models={models}
        departments={departments}
        fournisseurs={fournisseurs}
        onChange={handleInputChange}
      />
    </div>
  );
};

const FilterSelect = ({ label, options, value, onChange, icon }) => (
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
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${icon ? "pl-10" : ""
          }`}
      >
        <option value="">Tous</option>
        {options.map(opt => (
          <option key={opt._id} value={opt._id}>{opt.name}</option>
        ))}
      </select>
    </div>
  </div>
);

const SelectInput = ({ label, value, onChange, options, labels, icon }) => {
  const name = label.toLowerCase().replace(/\s+/g, '_');
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white border-gray-200 ${icon ? "pl-10" : ""} cursor-pointer`}
        >
          {options.map((opt, index) => (
            <option key={opt} value={opt} className="cursor-pointer">
              {labels[index]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, equipmentName }) => isOpen && (
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
        Êtes-vous sûr de vouloir supprimer {equipmentName} ?
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

const UpdateModal = ({ isOpen, onClose, onSave, equipment, errors, categories, models, departments, fournisseurs, onChange }) => isOpen && (
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier l'équipement</h3>
      </div>
      <div className="space-y-4">
        <InputField
          label="Nom"
          name="name"
          value={equipment.name}
          error={errors.name}
          onChange={onChange}
          icon={<Tag size={18} />}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Catégorie"
            name="categorie"
            value={equipment.categorie}
            options={categories}
            error={errors.categorie}
            onChange={onChange}
            icon={<Tag size={18} />}
          />
          <SelectField
            label="Modèle"
            name="model"
            value={equipment.model}
            options={models}
            onChange={onChange}
            icon={<Tag size={18} />}
          />
        </div>

        <InputField
          label="Numéro de série"
          name="serial_number"
          value={equipment.serial_number}
          error={errors.serial_number}
          onChange={onChange}
          icon={<Tag size={18} />}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date d'achat"
            name="purchase_date"
            type="date"
            value={equipment.purchase_date}
            error={errors.purchase_date}
            onChange={onChange}
            icon={<Calendar size={18} />}
          />
          <InputField
            label="Prix (TND)"
            name="prix"
            type="number"
            step="0.01"
            value={equipment.prix}
            error={errors.prix}
            onChange={onChange}
            icon={<DollarSign size={18} />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Statut"
            name="status"
            value={equipment.status}
            options={[
              { _id: "operational", name: "Opérationnel" },
              { _id: "maintenance", name: "En Maintenance" },
              { _id: "down", name: "Hors service" }
            ]}
            onChange={onChange}
            icon={<CheckCircle size={18} />}
          />
          <SelectField
            label="Garantie"
            name="warranty_status"
            value={equipment.warranty_status}
            options={[
              { _id: "valid", name: "Valide" },
              { _id: "expired", name: "Expirée" }
            ]}
            onChange={onChange}
            icon={<Shield size={18} />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Service"
            name="department"
            value={equipment.department}
            options={departments}
            error={errors.department}
            onChange={onChange}
            icon={<Building size={18} />}
          />
          <SelectField
            label="Fournisseur"
            name="fournisseur"
            value={equipment.fournisseur}
            options={fournisseurs}
            error={errors.fournisseur}
            onChange={onChange}
            icon={<Truck size={18} />}
          />
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

const InputField = ({ label, name, value, error, type = "text", onChange, icon, ...props }) => (
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
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${error ? 'border-red-500' : 'border-gray-200'
          } ${icon ? "pl-10" : ""}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, options, error, onChange, icon }) => (
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
        className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${error ? 'border-red-500' : 'border-gray-200'
          } ${icon ? "pl-10" : ""}`}
      >
        <option value="">Sélectionner...</option>
        {options.map(opt => (
          <option key={opt._id} value={opt._id}>{opt.name}</option>
        ))}
      </select>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default Products;