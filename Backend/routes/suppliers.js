const express = require('express');
const router = express.Router();
const Supplier = require('../models/Fournisseurs');

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ suppliers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;