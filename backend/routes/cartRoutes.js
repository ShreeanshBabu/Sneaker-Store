const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { getCart, addToCard, removeFromCart, updateCartItemQuantity } = require('../controllers/cartController');
const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/items', verifyToken, addToCard);
router.delete('/items/:id', verifyToken, removeFromCart);
router.patch('/items/:id', verifyToken, updateCartItemQuantity);

module.exports = router;