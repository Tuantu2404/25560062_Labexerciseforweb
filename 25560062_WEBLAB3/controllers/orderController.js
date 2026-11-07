const orderService = require('../services/orderService');

const orderController = {
  async create(req, res, next) {
    try {
      const { customerId, items } = req.body;
      if (!customerId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid payload: items must be a non-empty array' });
      }
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          return res.status(400).json({ error: 'Every item must have a valid productId and a positive integer quantity' });
        }
      }

      const newOrder = await orderService.createOrder({ customerId, items });
      return res.status(201).json(newOrder);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const { status, customerId, page, limit } = req.query;
      const result = await orderService.getOrders({ status, customerId, page, limit });
      return res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json(order);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const result = await orderService.updateOrderStatus(req.params.id, status);
      return res.json(result);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await orderService.deleteOrder(req.params.id);
      return res.json(result);
    } catch (err) {
      if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
      next(err);
    }
  },

  async salesAnalytics(req, res, next) {
    try {
      const analytics = await orderService.getSalesAnalytics();
      return res.json(analytics);
    } catch (err) {
      next(err);
    }
  },

  async customerHistory(req, res, next) {
    try {
      const history = await orderService.getCustomerOrderHistory(req.params.id);
      if (!history) return res.status(404).json({ error: 'Customer not found' });
      return res.json(history);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = orderController;