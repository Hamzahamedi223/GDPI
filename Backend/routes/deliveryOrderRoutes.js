const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../Controllers/deliveryOrderController');

// Get all delivery orders
router.get('/', deliveryOrderController.getAllDeliveryOrders);

// Get a single delivery order by ID
router.get('/:id', deliveryOrderController.getDeliveryOrderById);

// Create a new delivery order
router.post('/', deliveryOrderController.createDeliveryOrder);

// Update a delivery order
router.put('/:id', deliveryOrderController.updateDeliveryOrder);

// Delete a delivery order
router.delete('/:id', deliveryOrderController.deleteDeliveryOrder);

// Update delivery order status
router.patch('/:id/status', deliveryOrderController.updateDeliveryOrderStatus);

module.exports = router; 