import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Edit2, 
  Trash2,
  Filter,
  Search,
  Plus,
  Settings
} from 'lucide-react';
import * as panneService from '../../services/panneService';

const Pannes = () => {
  const [pannes, setPannes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPanne, setSelectedPanne] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [equipments, setEquipments] = useState([]);
  const [panneTypes, setPanneTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    fetchPannes();
    fetchEquipmentsAndTypes();
  }, []);

  const fetchEquipmentsAndTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access this feature');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [equipRes, typesRes] = await Promise.all([
        fetch('http://localhost:5000/api/equipment', { headers }),
        fetch('http://localhost:5000/api/panne-types', { headers })
      ]);

      if (!equipRes.ok || !typesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [equipData, typesData] = await Promise.all([
        equipRes.json(),
        typesRes.json()
      ]);

      setEquipments(equipData);
      setPanneTypes(typesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setPanneTypes([]);
      setEquipments([]);
    }
  };

  const fetchPannes = async () => {
    try {
      setLoading(true);
      const data = await panneService.getAllPannes();
      setPannes(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view pannes');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view pannes');
      } else {
        setError('Failed to load pannes. Please try again later.');
      }
      console.error('Error fetching pannes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      const updated = await panneService.updatePanne(id, updateData);
      setPannes(pannes.map(p => p._id === id ? updated : p));
      setShowUpdateModal(false);
      setSelectedPanne(null);
    } catch (err) {
      setError('Failed to update panne');
      console.error('Error updating panne:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this panne?')) return;
    
    try {
      await panneService.deletePanne(id);
      setPannes(pannes.filter(p => p._id !== id));
    } catch (err) {
      setError('Failed to delete panne');
      console.error('Error deleting panne:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const filteredPannes = pannes.filter(panne => {
    const matchesStatus = filterStatus === 'all' || panne.status === filterStatus;
    const matchesSearch = 
      panne.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panne.equipment?.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panne.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePanne = async (panneData) => {
    try {
      // Find the selected equipment to get its department
      const selectedEquipment = equipments.find(e => e._id === panneData.equipment);
      if (!selectedEquipment) {
        throw new Error('Selected equipment not found');
      }

      if (!selectedEquipment.department) {
        throw new Error('Selected equipment has no department assigned');
      }

      // Create the panne with the equipment's department
      const newPanne = await panneService.createPanne({
        ...panneData,
        department: selectedEquipment.department // Send the entire department object
      });
      
      setPannes([newPanne, ...pannes]);
      setShowCreateModal(false);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err.message || 'Failed to create panne');
      console.error('Error creating panne:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pannes</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Panne
          </button>

          <button
            onClick={() => setShowTypeModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Settings className="h-5 w-5 mr-2" />
            Types de Pannes
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Équipement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Département</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Signalé par</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Résolution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPannes.map((panne) => (
                <tr key={panne._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: panne.type?.color || '#6B7280',
                        color: '#FFFFFF'
                      }}
                    >
                      {panne.type?.name || 'Non spécifié'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{panne.equipment?.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{panne.equipment?.serial_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{panne.department?.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{panne.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(panne.status)}`}>
                      {getStatusIcon(panne.status)}
                      <span className="ml-1">{getStatusText(panne.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{panne.reportedBy?.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{panne.resolution || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPanne(panne);
                        setShowUpdateModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(panne._id)}
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
      </div>

      {showCreateModal && (
        <CreatePanneModal
          equipments={equipments.filter(e => e.department)}
          panneTypes={panneTypes || []}
          onClose={() => {
            setShowCreateModal(false);
            setError('');
          }}
          onCreate={handleCreatePanne}
        />
      )}

      {showUpdateModal && selectedPanne && (
        <UpdateModal
          panne={selectedPanne}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedPanne(null);
          }}
          onUpdate={handleUpdate}
          panneTypes={panneTypes}
        />
      )}

      {showTypeModal && (
        <PanneTypeModal
          types={panneTypes}
          onClose={() => setShowTypeModal(false)}
          onRefresh={fetchEquipmentsAndTypes}
        />
      )}
    </div>
  );
};

const UpdateModal = ({ panne, onClose, onUpdate, panneTypes }) => {
  const [formData, setFormData] = useState({
    status: panne.status,
    resolution: panne.resolution || '',
    type: panne.type?._id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(panne._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mettre à jour la Panne</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {panneTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Résolution</label>
            <textarea
              value={formData.resolution}
              onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
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

const CreatePanneModal = ({ equipments, panneTypes, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    equipment: '',
    type: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.equipment || !formData.type || !formData.description) {
      return; // Don't submit if required fields are empty
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nouvelle Panne</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Panne</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un type</option>
              {Array.isArray(panneTypes) && panneTypes.map(type => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipement</label>
            <select
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un équipement</option>
              {Array.isArray(equipments) && equipments.map(equip => (
                <option key={equip._id} value={equip._id}>
                  {equip.name} - {equip.serial_number} ({equip.department?.name || 'No Department'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorité</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
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

const PanneTypeModal = ({ types, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'alert-circle'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await panneService.createPanneType(formData);
      setFormData({
        name: '',
        description: '',
        color: '#6B7280',
        icon: 'alert-circle'
      });
      setError('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du type de panne');
      console.error('Error creating panne type:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pannes/check-type/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.inUse) {
        setError('Impossible de supprimer ce type car il est actuellement utilisé par une ou plusieurs pannes');
        return;
      }

      if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type ?')) return;
      
      await panneService.deletePanneType(id);
      setError('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du type de panne');
      console.error('Error deleting panne type:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Types de Pannes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Ajouter un nouveau type</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Couleur</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Types existants</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {types.map(type => (
                <div
                  key={type._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: type.color }}
                    />
    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</p>
                      {type.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(type._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Pannes; 