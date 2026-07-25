const DeliveryOrder = require('../models/DeliveryOrder');

// Get all delivery orders
exports.getAllDeliveryOrders = async (req, res) => {
  try {
    const deliveryOrders = await DeliveryOrder.find().sort({ createdAt: -1 });
    res.status(200).json(deliveryOrders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching delivery orders' });
  }
};

// Get a single delivery order by ID
exports.getDeliveryOrderById = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);
    if (!deliveryOrder) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    res.status(200).json(deliveryOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching delivery order' });
  }
};

// Create a new delivery order
exports.createDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = new DeliveryOrder(req.body);
    await deliveryOrder.save();
    res.status(201).json(deliveryOrder);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Reference number already exists' });
    } else {
      res.status(500).json({ error: 'Error creating delivery order' });
    }
  }
};

// Update a delivery order
exports.updateDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!deliveryOrder) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    res.status(200).json(deliveryOrder);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Reference number already exists' });
    } else {
      res.status(500).json({ error: 'Error updating delivery order' });
    }
  }
};

// Delete a delivery order
exports.deleteDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findByIdAndDelete(req.params.id);
    if (!deliveryOrder) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    res.status(200).json({ message: 'Delivery order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting delivery order' });
  }
};

// Update delivery order status
exports.updateDeliveryOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryOrder = await DeliveryOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!deliveryOrder) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    res.status(200).json(deliveryOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating delivery order status' });
  }
}; 