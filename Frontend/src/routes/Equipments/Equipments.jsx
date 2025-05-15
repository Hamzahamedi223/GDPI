import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Building, Tag, Calendar, DollarSign, Shield, CheckCircle, XCircle, Truck } from "lucide-react";

const Equipments = () => {
  const [formData, setFormData] = useState({
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

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, catRes, modelRes, fournRes] = await Promise.all([
          axios.get("http://localhost:5000/api/departments"),
          axios.get("http://localhost:5000/api/categories"),
          axios.get("http://localhost:5000/api/models"),
          axios.get("http://localhost:5000/api/fournisseurs"),
        ]);

        setDepartments(deptRes.data.departments);
        setCategories(catRes.data.categories);
        setModels(modelRes.data.models);
        setFournisseurs(fournRes.data.fournisseurs);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données.");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...formData,
        prix: parseFloat(formData.prix),
      };

      console.log("Sending data:", dataToSend);

      await axios.post("http://localhost:5000/api/equipment", dataToSend);

      alert("Équipement ajouté avec succès !");
      setFormData({
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
      console.error(err);
      setError("Erreur lors de l'ajout de l'équipement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Équipements</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ajoutez et gérez les équipements de l'hôpital
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nom"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              icon={<Tag size={18} />}
            />

            <SelectField
              label="Catégorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              options={categories}
              placeholder="Sélectionner une catégorie"
              icon={<Tag size={18} />}
            />

            <SelectField
              label="Modèle"
              name="model"
              value={formData.model}
              onChange={handleChange}
              options={models}
              placeholder="Sélectionner un modèle"
              icon={<Tag size={18} />}
            />

            <InputField
              label="Numéro de série"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              required
              icon={<Tag size={18} />}
            />

            <InputField
              label="Date d'achat"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={handleChange}
              required
              icon={<Calendar size={18} />}
            />

            <InputField
              label="Prix"
              name="prix"
              type="number"
              value={formData.prix}
              onChange={handleChange}
              required
              icon={<DollarSign size={18} />}
            />

            <SelectField
              label="Statut"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { _id: "operational", name: "Opérationnel" },
                { _id: "down", name: "Hors service" },
              ]}
              icon={<CheckCircle size={18} />}
            />

            <SelectField
              label="Statut de garantie"
              name="warranty_status"
              value={formData.warranty_status}
              onChange={handleChange}
              options={[
                { _id: "valid", name: "Valid" },
                { _id: "expired", name: "Expired" },
              ]}
              icon={<Shield size={18} />}
            />

            <SelectField
              label="Service"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments}
              placeholder="Sélectionner un Service"
              icon={<Building size={18} />}
            />

            <SelectField
              label="Fournisseur"
              name="fournisseur"
              value={formData.fournisseur}
              onChange={handleChange}
              options={fournisseurs}
              placeholder="Sélectionner un fournisseur"
              icon={<Truck size={18} />}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            <Plus size={18} />
            {loading ? "Ajout en cours..." : "Ajouter l'équipement"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

// Reusable input field
const InputField = ({ label, name, value, onChange, type = "text", required = false, icon }) => (
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
        required={required}
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
          icon ? "pl-10" : ""
        }`}
      />
    </div>
  </div>
);

// Reusable select field
const SelectField = ({ label, name, value, onChange, options, placeholder = "", icon }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
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
        className={`w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
          icon ? "pl-10" : ""
        }`}
      >
        <option value="">{placeholder || `Sélectionner ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default Equipments;
