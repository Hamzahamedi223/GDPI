import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Tag, Building, Calendar, DollarSign, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

const initialFormState = {
  name: '',
  part_number: '',
  category: '',
  supplier: '',
  department: '',
  purchase_date: '',
  price: '',
  status: 'available',
};

export default function Piece() {
  const [spareParts, setSpareParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [partsRes, catsRes, supsRes, deptsRes] = await Promise.all([
          api.get('/spareparts'),
          api.get('/categories'),
          api.get('/suppliers'),
          api.get('/departments'),
        ]);
        setSpareParts(partsRes.data);
        setCategories(catsRes.data.categories || catsRes.data);
        setSuppliers(supsRes.data.suppliers || supsRes.data);
        setDepartments(deptsRes.data.departments || deptsRes.data);
      } catch (e) {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.part_number.trim()) errs.part_number = 'Part number is required';
    if (!formData.category) errs.category = 'Category required';
    if (!formData.supplier) errs.supplier = 'Supplier required';
    if (!formData.department) errs.department = 'Department required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0)
      errs.price = 'Valid price required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        purchase_date: formData.purchase_date || new Date().toISOString(),
      };
      const res = await api.post('/spareparts', payload);
      const created = {
        ...res.data,
        category: categories.find(c => c._id === res.data.category),
        supplier: suppliers.find(s => s._id === res.data.supplier),
        department: departments.find(d => d._id === res.data.department),
      };
      setSpareParts([created, ...spareParts]);
      resetForm();
      toast.success('Pièce créée avec succès');
    } catch (e) {
      setError('Creation failed.');
      toast.error('Erreur lors de la création de la pièce');
    }
  };

  const openUpdateModal = part => {
    setSelectedPart(part);
    setFormData({
      name: part.name,
      part_number: part.part_number,
      category: part.category?._id || '',
      supplier: part.supplier?._id || '',
      department: part.department?._id || '',
      purchase_date: part.purchase_date?.split('T')[0] || '',
      price: part.price?.toString() || '',
      status: part.status,
    });
    setFormErrors({});
    setShowUpdateModal(true);
  };

  const handleUpdate = async e => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        purchase_date: formData.purchase_date
          ? new Date(formData.purchase_date).toISOString()
          : new Date().toISOString(),
        status: formData.status,
      };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      const res = await api.put(
        `/spareparts/${selectedPart._id}`,
        payload,
        config
      );
      const updatedData = res.data;
  
      // Extract IDs from the response data whether they're objects or strings
      const getID = (field) => (field?._id ? field._id : field);
  
      const updated = {
        ...updatedData,
        category: categories.find(c => c._id === getID(updatedData.category)),
        supplier: suppliers.find(s => s._id === getID(updatedData.supplier)),
        department: departments.find(d => d._id === getID(updatedData.department)),
      };
  
      setSpareParts(spareParts.map(p => (p._id === updated._id ? updated : p)));
      setShowUpdateModal(false);
      resetForm();
      setSelectedPart(null);
      toast.success('Pièce mise à jour avec succès');
    } catch (err) {
      console.error('Update Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Update failed.');
      toast.error('Erreur lors de la mise à jour de la pièce');
    }
  };

  const openDeleteModal = part => {
    setSelectedPart(part);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/spareparts/${selectedPart._id}`);
      setSpareParts(spareParts.filter(p => p._id !== selectedPart._id));
      setShowDeleteModal(false);
      setSelectedPart(null);
      toast.success('Pièce supprimée avec succès');
    } catch (e) {
      setError('Delete failed.');
      toast.error('Erreur lors de la suppression de la pièce');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-t-blue-500 rounded-full" />
      </div>
    );

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Pièces de Rechange</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les pièces de rechange de l'hôpital
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

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ajouter une pièce</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nom"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            icon={<Tag size={18} />}
          />
          <InputField
            label="Numéro de pièce"
            name="part_number"
            value={formData.part_number}
            onChange={handleChange}
            error={formErrors.part_number}
            icon={<Tag size={18} />}
          />
          <SelectField
            label="Catégorie"
            name="category"
            value={formData.category}
            options={categories}
            onChange={handleChange}
            error={formErrors.category}
            icon={<Tag size={18} />}
          />
          <SelectField
            label="Fournisseur"
            name="supplier"
            value={formData.supplier}
            options={suppliers}
            onChange={handleChange}
            error={formErrors.supplier}
            icon={<Tag size={18} />}
          />
          <SelectField
            label="Service"
            name="department"
            value={formData.department}
            options={departments}
            onChange={handleChange}
            error={formErrors.department}
            icon={<Building size={18} />}
          />
          <InputField
            label="Prix"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={formErrors.price}
            step="0.01"
            icon={<DollarSign size={18} />}
          />
          <InputField
            label="Date d'achat"
            name="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={handleChange}
            icon={<Calendar size={18} />}
          />
          <SelectField
            label="Statut"
            name="status"
            value={formData.status}
            options={[
              { _id: 'available', name: 'Disponible' },
              { _id: 'unavailable', name: 'Indisponible' },
            ]}
            onChange={handleChange}
            icon={<CheckCircle size={18} />}
          />
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                {['Nom', 'Numéro', 'Catégorie', 'Fournisseur', 'Service', 'Prix', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {spareParts.map(p => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.part_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.supplier?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.department?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    €{p.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      p.status === 'available' 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {p.status === 'available' ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openUpdateModal(p)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openDeleteModal(p)}
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

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          resetForm();
        }}
        onSave={handleUpdate}
        data={formData}
        errors={formErrors}
        categories={categories}
        suppliers={suppliers}
        departments={departments}
        onChange={handleChange}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item={selectedPart?.name}
      />
    </div>
  );
}

const InputField = ({ label, name, value, onChange, error, type = 'text', icon, ...props }) => (
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

const SelectField = ({ label, name, value, options, onChange, error, icon }) => (
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
        <option value="">Sélectionner...</option>
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

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, categories, suppliers, departments, onChange }) => isOpen && (
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier la pièce</h3>
      </div>
      <div className="space-y-4">
        <InputField
          label="Nom"
          name="name"
          value={data.name}
          onChange={onChange}
          error={errors.name}
          icon={<Tag size={18} />}
        />
        <InputField
          label="Numéro de pièce"
          name="part_number"
          value={data.part_number}
          onChange={onChange}
          error={errors.part_number}
          icon={<Tag size={18} />}
        />
        <SelectField
          label="Catégorie"
          name="category"
          value={data.category}
          options={categories}
          onChange={onChange}
          error={errors.category}
          icon={<Tag size={18} />}
        />
        <SelectField
          label="Fournisseur"
          name="supplier"
          value={data.supplier}
          options={suppliers}
          onChange={onChange}
          error={errors.supplier}
          icon={<Tag size={18} />}
        />
        <SelectField
          label="Service"
          name="department"
          value={data.department}
          options={departments}
          onChange={onChange}
          error={errors.department}
          icon={<Building size={18} />}
        />
        <InputField
          label="Prix"
          name="price"
          type="number"
          value={data.price}
          onChange={onChange}
          error={errors.price}
          step="0.01"
          icon={<DollarSign size={18} />}
        />
        <InputField
          label="Date d'achat"
          name="purchase_date"
          type="date"
          value={data.purchase_date}
          onChange={onChange}
          icon={<Calendar size={18} />}
        />
        <SelectField
          label="Statut"
          name="status"
          value={data.status}
          options={[
            { _id: 'available', name: 'Disponible' },
            { _id: 'unavailable', name: 'Indisponible' },
          ]}
          onChange={onChange}
          icon={<CheckCircle size={18} />}
        />
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
        Êtes-vous sûr de vouloir supprimer {item} ?
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
