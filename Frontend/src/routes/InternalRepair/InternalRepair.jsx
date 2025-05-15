import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, Tag, Calendar, CheckCircle, XCircle, Edit2, Trash2, Clock } from 'lucide-react';

const InternalRepair = () => {
  const [repairs, setRepairs] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [formData, setFormData] = useState({
    equipment: '',
    sparePart: '',
    description: '',
    repairDate: '',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repairsRes, equipmentsRes, sparePartsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/internal-repairs'),
          axios.get('http://localhost:5000/api/equipment'),
          axios.get('http://localhost:5000/api/spareParts')
        ]);

        console.log('Repairs data:', repairsRes.data);
        console.log('Equipments data:', equipmentsRes.data);
        console.log('SpareParts data:', sparePartsRes.data);

        setRepairs(repairsRes.data);
        setEquipments(equipmentsRes.data);
        setSpareParts(sparePartsRes.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.equipment) errors.equipment = 'Équipement requis';
    if (!formData.sparePart) errors.sparePart = 'Pièce de rechange requise';
    if (!formData.description.trim()) errors.description = 'Description requise';
    if (!formData.repairDate) errors.repairDate = 'Date de réparation requise';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post('http://localhost:5000/api/internal-repairs', formData);
      setRepairs([response.data, ...repairs]);
      setFormData({
        equipment: '',
        sparePart: '',
        description: '',
        repairDate: '',
        status: 'pending'
      });
    } catch (err) {
      setError('Erreur lors de la création de la réparation');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/internal-repairs/${selectedRepair._id}`,
        formData
      );
      setRepairs(repairs.map(repair => 
        repair._id === selectedRepair._id ? response.data : repair
      ));
      setShowUpdateModal(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la réparation');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/internal-repairs/${selectedRepair._id}`);
      setRepairs(repairs.filter(repair => repair._id !== selectedRepair._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError('Erreur lors de la suppression de la réparation');
    }
  };

  const openUpdateModal = (repair) => {
    setSelectedRepair(repair);
    setFormData({
      equipment: repair.equipment?._id || repair.equipment,
      sparePart: repair.sparePart?._id || repair.sparePart,
      description: repair.description || '',
      repairDate: repair.repairDate ? repair.repairDate.split('T')[0] : '',
      status: repair.status || 'pending'
    });
    setFormErrors({});
    setShowUpdateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-[70px] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Réparations </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les réparations internes des équipements
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

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ajouter une réparation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Équipement"
            name="equipment"
            value={formData.equipment}
            options={equipments}
            onChange={handleInputChange}
            error={formErrors.equipment}
            icon={<Tag size={18} />}
          />
          <SelectField
            label="Pièce de rechange"
            name="sparePart"
            value={formData.sparePart}
            options={spareParts}
            onChange={handleInputChange}
            error={formErrors.sparePart}
            icon={<Tag size={18} />}
          />
          <InputField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            icon={<Tag size={18} />}
          />
          <InputField
            label="Date de réparation"
            name="repairDate"
            type="date"
            value={formData.repairDate}
            onChange={handleInputChange}
            error={formErrors.repairDate}
            icon={<Calendar size={18} />}
          />
          <SelectField
            label="Statut"
            name="status"
            value={formData.status}
            options={[
              { _id: 'pending', name: 'En cours' },
              { _id: 'completed', name: 'Terminé' }
            ]}
            onChange={handleInputChange}
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
                {['Équipement', 'Pièce de rechange', 'Description', 'Date ajout', 'Date réparation', 'Statut', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {repairs.map(repair => (
                <motion.tr
                  key={repair._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {repair.equipment?.name} (SN"{repair.equipment?.serial_number}")
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {repair.sparePart?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {repair.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(repair.dateAdded).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(repair.repairDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      repair.status === 'completed' 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {repair.status === 'completed' ? 'Terminé' : 'En cours'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openUpdateModal(repair)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedRepair(repair);
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
      </motion.div>

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSave={handleUpdate}
        data={formData}
        errors={formErrors}
        equipments={equipments}
        spareParts={spareParts}
        onChange={handleInputChange}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        item={selectedRepair?.equipment?.name}
      />
    </div>
  );
};

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

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, equipments, spareParts, onChange }) => isOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Modifier la réparation</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mettez à jour les informations de la réparation
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <span className="sr-only">Fermer</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </div>

      <div className="space-y-4">
        <SelectField
          label="Équipement"
          name="equipment"
          value={data.equipment}
          options={equipments}
          onChange={onChange}
          error={errors.equipment}
          icon={<Tag size={18} />}
        />
        <SelectField
          label="Pièce de rechange"
          name="sparePart"
          value={data.sparePart}
          options={spareParts}
          onChange={onChange}
          error={errors.sparePart}
          icon={<Tag size={18} />}
        />
        <InputField
          label="Description"
          name="description"
          value={data.description}
          onChange={onChange}
          error={errors.description}
          icon={<Tag size={18} />}
        />
        <InputField
          label="Date de réparation"
          name="repairDate"
          type="date"
          value={data.repairDate}
          onChange={onChange}
          error={errors.repairDate}
          icon={<Calendar size={18} />}
        />
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Statut de la réparation</h4>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ target: { name: 'status', value: 'pending' } })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                data.status === 'pending'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className={`h-5 w-5 ${data.status === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
              <span className="font-medium">En cours</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ target: { name: 'status', value: 'completed' } })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                data.status === 'completed'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle className={`h-5 w-5 ${data.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium">Terminé</span>
            </motion.button>
          </div>
        </div>

        <div className="flex justify-end gap-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            Enregistrer les modifications
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
        Êtes-vous sûr de vouloir supprimer la réparation de {item} ?
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

export default InternalRepair; 