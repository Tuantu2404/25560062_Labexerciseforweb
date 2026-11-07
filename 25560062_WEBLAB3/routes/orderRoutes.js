const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 1. Đặt các route analytics và customer-history lên TRƯỚC các route có :id
router.get('/orders/analytics/sales-summary', orderController.salesAnalytics);
router.get('/customers/:id/order-history', orderController.customerHistory);

// 2. Các route CRUD cơ bản
router.post('/orders', orderController.create);
router.get('/orders', orderController.list);
router.get('/orders/:id', orderController.getById);
router.patch('/orders/:id/status', orderController.updateStatus);
router.delete('/orders/:id', orderController.remove);

module.exports = router;