const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/cart', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  return res.json(user.cart);
});

router.post('/cart', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    return res.json(updatedUser.cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/cart/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product');
    return res.json(updatedUser.cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
