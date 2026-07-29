const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { checkout, getOrderById, getUserOrders, updateOrderStatus } = require('../controllers/orderController');
const router = express.Router();

router.post('/checkout', verifyToken, checkout);
router.get('/', verifyToken, getUserOrders);
router.get('/:id', verifyToken, getOrderById);
router.patch('/:id', verifyToken, updateOrderStatus);

module.exports = router;