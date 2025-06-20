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
  Clock,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

const DeliveryOrders = () => {
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("");

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
        const [deliveryRes, purchaseRes] = await Promise.all([
          axios.get("http://localhost:5000/api/delivery-orders"),
          axios.get("http://localhost:5000/api/purchase-orders")
        ]);
        setDeliveryOrders(deliveryRes.data);
        setPurchaseOrders(purchaseRes.data);
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
      toast.success("Bon de livraison créé avec succès");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création du bon de livraison");
      toast.error(err.response?.data?.error || "Erreur lors de la création du bon de livraison");
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
      toast.success("Bon de livraison mis à jour avec succès");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du bon de livraison");
      toast.error(err.response?.data?.error || "Erreur lors de la mise à jour du bon de livraison");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/delivery-orders/${selectedOrder._id}`);
      setDeliveryOrders(deliveryOrders.filter(order => order._id !== selectedOrder._id));
      setShowDeleteModal(false);
      toast.success("Bon de livraison supprimé avec succès");
    } catch (err) {
      setError("Erreur lors de la suppression du bon de livraison");
      toast.error("Erreur lors de la suppression du bon de livraison");
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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bon de Livraison - ${order.reference}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
              font-size: 14px;
            }
            .info-value {
              margin-top: 5px;
              font-size: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #666;
            }
            .total {
              text-align: right;
              font-weight: bold;
              font-size: 18px;
              margin-top: 20px;
            }
            .notes {
              margin-top: 30px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .status {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 14px;
              font-weight: bold;
            }
            .status-delivered { background-color: #d1fae5; color: #065f46; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-cancelled { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bon de Livraison</h1>
            <p>Référence: ${order.reference}</p>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Client</div>
              <div class="info-value">${order.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date de Livraison</div>
              <div class="info-value">${new Date(order.deliveryDate).toLocaleDateString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Téléphone</div>
              <div class="info-value">${order.customerPhone}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Statut</div>
              <div class="info-value">
                <span class="status status-${order.status}">
                  ${order.status === "delivered" ? "Livré" : 
                    order.status === "cancelled" ? "Annulé" : "En attente"}
                </span>
              </div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Adresse</div>
              <div class="info-value">${order.customerAddress}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantité</th>
                <th style="text-align: right;">Prix Unitaire</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: right;">${item.quantity}</td>
                  <td style="text-align: right;">${parseFloat(item.unitPrice).toFixed(2)} €</td>
                  <td style="text-align: right;">${(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Total</td>
                <td style="text-align: right; font-weight: bold;">${calculateOrderTotal(order.items).toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          ${order.notes ? `
            <div class="notes">
              <div class="info-label">Notes</div>
              <div class="info-value">${order.notes}</div>
            </div>
          ` : ''}

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer
            </button>
          </div>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    };
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Référence (Importée du Bon de Commande) {formErrors.reference && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white pl-10 ${
                  formErrors.reference ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Sélectionner une référence de bon de commande...</option>
                {purchaseOrders.map(order => (
                  <option key={order._id} value={order.reference}>
                    {order.reference} - {order.fournisseur?.name || 'Fournisseur inconnu'}
                  </option>
                ))}
              </select>
            </div>
            {formErrors.reference && (
              <p className="text-red-500 text-xs mt-1">{formErrors.reference}</p>
            )}
          </div>
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

      {/* Delivery Orders Table with Filters */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un bon de livraison..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="ml-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-wrap gap-4">
                  <FilterSelect
                    label="Statut"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                      { _id: "", name: "Tous" },
                      { _id: "pending", name: "En attente" },
                      { _id: "delivered", name: "Livré" },
                      { _id: "cancelled", name: "Annulé" }
                    ]}
                    icon={<Truck size={16} />}
                  />

                  <FilterSelect
                    label="Méthode de Paiement"
                    value={selectedPaymentMethod}
                    onChange={setSelectedPaymentMethod}
                    options={[
                      { _id: "", name: "Tous" },
                      { _id: "cash", name: "Espèces" },
                      { _id: "card", name: "Carte" },
                      { _id: "transfer", name: "Virement" }
                    ]}
                    icon={<DollarSign size={16} />}
                  />

                  <FilterSelect
                    label="Méthode de Livraison"
                    value={selectedDeliveryMethod}
                    onChange={setSelectedDeliveryMethod}
                    options={[
                      { _id: "", name: "Tous" },
                      { _id: "standard", name: "Standard" },
                      { _id: "express", name: "Express" },
                      { _id: "pickup", name: "Point Relais" }
                    ]}
                    icon={<Truck size={16} />}
                  />
                </div>

                {(selectedStatus || selectedPaymentMethod || selectedDeliveryMethod) && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Filtres actifs:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedStatus && (
                        <FilterChip
                          label={`Statut: ${
                            selectedStatus === "pending" ? "En attente" :
                            selectedStatus === "delivered" ? "Livré" : "Annulé"
                          }`}
                          onRemove={() => setSelectedStatus("")}
                        />
                      )}
                      {selectedPaymentMethod && (
                        <FilterChip
                          label={`Paiement: ${
                            selectedPaymentMethod === "cash" ? "Espèces" :
                            selectedPaymentMethod === "card" ? "Carte" : "Virement"
                          }`}
                          onRemove={() => setSelectedPaymentMethod("")}
                        />
                      )}
                      {selectedDeliveryMethod && (
                        <FilterChip
                          label={`Livraison: ${
                            selectedDeliveryMethod === "standard" ? "Standard" :
                            selectedDeliveryMethod === "express" ? "Express" : "Point Relais"
                          }`}
                          onRemove={() => setSelectedDeliveryMethod("")}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Table */}
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
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDeleteModal && (
        <DeleteModal
            key="delete-modal"
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          item={selectedOrder?.reference}
        />
        )}

        {showUpdateModal && (
        <UpdateModal
            key="update-modal"
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
          purchaseOrders={purchaseOrders}
        />
        )}

        {showViewModal && (
        <ViewModal
            key="view-modal"
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          order={selectedOrder}
          calculateTotal={calculateOrderTotal}
        />
        )}
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

const UpdateModal = ({ isOpen, onClose, onSave, data, errors, onChange, onItemChange, onAddItem, onRemoveItem, calculateTotal, purchaseOrders }) => isOpen && (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Référence (Importée du Bon de Commande) {errors.reference && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  name="reference"
                  value={data.reference}
                  onChange={onChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-slate-800 dark:text-white pl-10 ${
                    errors.reference ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="">Sélectionner une référence de bon de commande...</option>
                  {purchaseOrders.map(order => (
                    <option key={order._id} value={order.reference}>
                      {order.reference} - {order.fournisseur?.name || 'Fournisseur inconnu'}
                    </option>
                  ))}
                </select>
              </div>
              {errors.reference && (
                <p className="text-red-500 text-xs mt-1">{errors.reference}</p>
              )}
            </div>
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
                  <td colSpan="3" style="text-align: right; font-weight: bold;">Total</td>
                  <td style="text-align: right; font-weight: bold;">{calculateTotal(order.items).toFixed(2)} €</td>
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

const FilterChip = ({ label, onRemove }) => (
  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm dark:bg-blue-900/30 dark:text-blue-400">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-blue-900 dark:hover:text-blue-300"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

const FilterSelect = ({ label, options, value, onChange, icon }) => (
  <div className="relative min-w-[180px]">
    <div className="relative">
      {icon && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full ${icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800`}
      >
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default DeliveryOrders;
