import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Edit2, 
  Trash2, 
  Download, 
  Filter, 
  Truck, 
  Search, 
  Printer, 
  Eye,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Package,
  DollarSign,
  Clock
} from "lucide-react";

const DeliveryOrders = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    deliveryDate: '',
    reference: '',
    items: [{ description: '', quantity: '', unitPrice: '' }],
    status: 'pending',
    notes: '',
    paymentMethod: 'cash',
    deliveryMethod: 'standard'
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'deliveryDate', direction: 'desc' });

  // Calculate totals for items
  const calculateItemTotal = (item) => {
    return (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/delivery-orders");
        setDeliveryOrders(response.data);
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
    if (!formData.customerName) errors.customerName = "Nom du client requis";
    if (!formData.customerAddress) errors.customerAddress = "Adresse requise";
    if (!formData.customerPhone) errors.customerPhone = "Téléphone requis";
    if (!formData.deliveryDate) errors.deliveryDate = "Date de livraison requise";
    if (!formData.reference) errors.reference = "Référence requise";
    if (formData.items.some(item => !item.description || !item.quantity || !item.unitPrice)) {
      errors.items = "Tous les champs des articles sont requis";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const orderData = {
        ...formData,
        total: calculateOrderTotal(formData.items),
        createdAt: new Date().toISOString()
      };

      const response = await axios.post("http://localhost:5000/api/delivery-orders", orderData);
      setDeliveryOrders([response.data, ...deliveryOrders]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création du bon de livraison");
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const orderData = {
        ...formData,
        total: calculateOrderTotal(formData.items),
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(
        `http://localhost:5000/api/delivery-orders/${selectedOrder._id}`,
        orderData
      );
      setDeliveryOrders(deliveryOrders.map(order => 
        order._id === selectedOrder._id ? response.data : order
      ));
      setShowUpdateModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du bon de livraison");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/delivery-orders/${selectedOrder._id}`);
      setDeliveryOrders(deliveryOrders.filter(order => order._id !== selectedOrder._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Erreur lors de la suppression du bon de livraison");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', unitPrice: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerAddress: '',
      customerPhone: '',
      deliveryDate: '',
      reference: '',
      items: [{ description: '', quantity: '', unitPrice: '' }],
      status: 'pending',
      notes: '',
      paymentMethod: 'cash',
      deliveryMethod: 'standard'
    });
    setFormErrors({});
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      customerPhone: order.customerPhone,
      deliveryDate: order.deliveryDate.split('T')[0],
      reference: order.reference,
      items: order.items,
      status: order.status,
      notes: order.notes || '',
      paymentMethod: order.paymentMethod || 'cash',
      deliveryMethod: order.deliveryMethod || 'standard'
    });
    setFormErrors({});
    setShowUpdateModal(true);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePrint = (order) => {
    // Implement print functionality
    window.print();
  };

  // Filter orders based on search query and status
  const filteredOrders = deliveryOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key === 'deliveryDate') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.deliveryDate) - new Date(b.deliveryDate)
        : new Date(b.deliveryDate) - new Date(a.deliveryDate);
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key]?.localeCompare(b[sortConfig.key])
      : b[sortConfig.key]?.localeCompare(a[sortConfig.key]);
  });

  return (
    <div className="pt-[70px] p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Bons de Livraison</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Gérez et suivez tous vos bons de livraison en un seul endroit
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nouveau Bon</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bons</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {deliveryOrders.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {deliveryOrders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Livrés</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {deliveryOrders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur Totale</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                  {deliveryOrders.reduce((total, order) => total + (order.total || 0), 0).toFixed(2)} €
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>
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

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Rechercher par client, référence ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <SelectInput
              label="Statut"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={["", "pending", "delivered", "cancelled"]}
              labels={["Tous", "En attente", "Livré", "Annulé"]}
              icon={<Truck size={18} />}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              <Filter size={18} />
              <span>Filtres</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Create Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ajouter un bon de livraison</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Remplissez les informations pour créer un nouveau bon de livraison
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Créer</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Nom du Client"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            error={formErrors.customerName}
            icon={<FileText size={18} />}
          />
          <InputField
            label="Téléphone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            error={formErrors.customerPhone}
            icon={<FileText size={18} />}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse de Livraison {formErrors.customerAddress && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleInputChange}
              rows="3"
              className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
                formErrors.customerAddress ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {formErrors.customerAddress && (
              <p className="text-red-500 text-xs mt-1">{formErrors.customerAddress}</p>
            )}
          </div>
          <InputField
            label="Date de Livraison"
            name="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={handleInputChange}
            error={formErrors.deliveryDate}
            icon={<Calendar size={18} />}
          />
          <InputField
            label="Référence"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            error={formErrors.reference}
            icon={<FileText size={18} />}
          />
          <SelectInput
            label="Méthode de Paiement"
            value={formData.paymentMethod}
            onChange={(value) => handleInputChange({ target: { name: 'paymentMethod', value } })}
            options={['cash', 'card', 'transfer']}
            labels={['Espèces', 'Carte', 'Virement']}
            icon={<FileText size={18} />}
          />
          <SelectInput
            label="Méthode de Livraison"
            value={formData.deliveryMethod}
            onChange={(value) => handleInputChange({ target: { name: 'deliveryMethod', value } })}
            options={['standard', 'express', 'pickup']}
            labels={['Standard', 'Express', 'Point Relais']}
            icon={<Truck size={18} />}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              placeholder="Notes additionnelles..."
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Articles</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} />
              <span>Ajouter un article</span>
            </motion.button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prix Unitaire
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  {index > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {formErrors.items && (
            <p className="text-red-500 text-xs mt-2">{formErrors.items}</p>
          )}

          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {calculateOrderTotal(formData.items).toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </motion.form>

      {/* Delivery Orders Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun bon de livraison trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400">Commencez par créer un nouveau bon de livraison</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {[
                      { key: 'reference', label: 'Référence' },
                      { key: 'customerName', label: 'Client' },
                      { key: 'deliveryDate', label: 'Date' },
                      { key: 'total', label: 'Total' },
                      { key: 'status', label: 'Statut' },
                      { key: 'actions', label: 'Actions' }
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => key !== 'actions' && handleSort(key)}
                        className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                          key !== 'actions' ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {label}
                          {sortConfig.key === key && (
                            <span>{sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.reference}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.total?.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "delivered" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {order.status === "delivered" ? "Livré" : 
                           order.status === "cancelled" ? "Annulé" : "En attente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowViewModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Eye size={18} />
                          </motion.button>
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
                            onClick={() => handlePrint(order)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Printer size={18} />
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
      <AnimatePresence>
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
          onChange={handleInputChange}
          onItemChange={handleItemChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          calculateTotal={calculateOrderTotal}
        />

        <ViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          order={selectedOrder}
          calculateTotal={calculateOrderTotal}
        />
      </AnimatePresence>
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
        Êtes-vous sûr de vouloir supprimer le bon de livraison "{item}" ?
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

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, onChange, onItemChange, onAddItem, onRemoveItem, calculateTotal }) => isOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Modifier le bon de livraison</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mettez à jour les informations du bon de livraison
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

      <div className="space-y-6">
        {/* Status Update Section */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Mise à jour du statut</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <span className="font-medium">En attente</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ target: { name: 'status', value: 'delivered' } })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                data.status === 'delivered'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Truck className={`h-5 w-5 ${data.status === 'delivered' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium">Livré</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ target: { name: 'status', value: 'cancelled' } })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                data.status === 'cancelled'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <AlertCircle className={`h-5 w-5 ${data.status === 'cancelled' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-medium">Annulé</span>
            </motion.button>
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Informations client</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nom du Client"
              name="customerName"
              value={data.customerName}
              onChange={onChange}
              error={errors.customerName}
              icon={<FileText size={18} />}
            />
            <InputField
              label="Téléphone"
              name="customerPhone"
              value={data.customerPhone}
              onChange={onChange}
              error={errors.customerPhone}
              icon={<FileText size={18} />}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse de Livraison {errors.customerAddress && <span className="text-red-500">*</span>}
              </label>
              <textarea
                name="customerAddress"
                value={data.customerAddress}
                onChange={onChange}
                rows="3"
                className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white ${
                  errors.customerAddress ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.customerAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.customerAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Détails de livraison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Date de Livraison"
              name="deliveryDate"
              type="date"
              value={data.deliveryDate}
              onChange={onChange}
              error={errors.deliveryDate}
              icon={<Calendar size={18} />}
            />
            <InputField
              label="Référence"
              name="reference"
              value={data.reference}
              onChange={onChange}
              error={errors.reference}
              icon={<FileText size={18} />}
            />
            <SelectInput
              label="Méthode de Paiement"
              value={data.paymentMethod}
              onChange={(value) => onChange({ target: { name: 'paymentMethod', value } })}
              options={['cash', 'card', 'transfer']}
              labels={['Espèces', 'Carte', 'Virement']}
              icon={<FileText size={18} />}
            />
            <SelectInput
              label="Méthode de Livraison"
              value={data.deliveryMethod}
              onChange={(value) => onChange({ target: { name: 'deliveryMethod', value } })}
              options={['standard', 'express', 'pickup']}
              labels={['Standard', 'Express', 'Point Relais']}
              icon={<Truck size={18} />}
            />
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Articles</h4>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onAddItem}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} />
              <span>Ajouter un article</span>
            </motion.button>
          </div>

          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onItemChange(index, 'description', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prix Unitaire
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => onItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  {index > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.items && (
            <p className="text-red-500 text-xs mt-2">{errors.items}</p>
          )}

          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {calculateTotal(data.items).toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Notes</h4>
          <textarea
            name="notes"
            value={data.notes}
            onChange={onChange}
            rows="3"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
            placeholder="Notes additionnelles..."
          />
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

const ViewModal = ({ isOpen, onClose, order, calculateTotal }) => isOpen && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Détails du Bon de Livraison
          </h3>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Référence</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.reference}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de Livraison</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(order.deliveryDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.customerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.customerPhone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{order.customerAddress}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Articles</h4>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Prix Unitaire
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                      {parseFloat(item.unitPrice).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">
                      {(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                    {calculateTotal(order.items).toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {order.notes && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.notes}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Fermer
          </motion.button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default DeliveryOrders;
