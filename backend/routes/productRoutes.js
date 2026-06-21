const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, image, price } = req.body;

    if (!name || !image || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, image, and price' });
    }

    const product = await Product.create({ name, image, price });
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
