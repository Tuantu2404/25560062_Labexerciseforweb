const pool = require('../config/db');

const orderService = {
  // 1. Create Order (Transaction + FOR UPDATE)
  async createOrder({ customerId, items }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Kiểm tra customer có tồn tại không
      const [customers] = await conn.query('SELECT id FROM customers WHERE id = ?', [customerId]);
      if (customers.length === 0) {
        const err = new Error('Customer not found');
        err.statusCode = 404;
        throw err;
      }

      // Lấy danh sách product IDs
      const productIds = items.map(i => i.productId);

      // SELECT ... FOR UPDATE khóa hàng để tránh tranh chấp kho
      const [products] = await conn.query(
        'SELECT id, product_name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
        [productIds]
      );

      const productMap = new Map();
      products.forEach(p => productMap.set(p.id, p));

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          const err = new Error(`Product with ID ${item.productId} not found`);
          err.statusCode = 404;
          throw err;
        }
        if (product.stock < item.quantity) {
          const err = new Error(`Product ${product.product_name} is out of stock`);
          err.statusCode = 400;
          throw err;
        }

        const unitPrice = product.price;
        totalAmount += unitPrice * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice
        });

        // Trừ tồn kho
        await conn.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Insert vào bảng orders
      const [orderResult] = await conn.query(
        'INSERT INTO orders (customer_id, status, total_amount) VALUES (?, "pending", ?)',
        [customerId, totalAmount]
      );
      const orderId = orderResult.insertId;

      // Insert vào bảng order_items
      for (const oi of orderItemsData) {
        await conn.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, oi.productId, oi.quantity, oi.unitPrice]
        );
      }

      await conn.commit();
      return { id: orderId, customerId, status: 'pending', total_amount: totalAmount, items: orderItemsData };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // 2. List Orders with Filtering, Pagination & JOIN
  async getOrders({ status, customerId, page = 1, limit = 5 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.id AS order_id, c.full_name AS customer_name, c.email, 
             o.status, o.total_amount, 
             COALESCE(SUM(oi.quantity), 0) AS total_items_count, 
             o.created_at
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(DISTINCT o.id) AS total FROM orders o WHERE 1=1`;
    const queryParams = [];
    const countParams = [];

    if (status) {
      query += ` AND o.status = ?`;
      countQuery += ` AND o.status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }
    if (customerId) {
      query += ` AND o.customer_id = ?`;
      countQuery += ` AND o.customer_id = ?`;
      queryParams.push(customerId);
      countParams.push(customerId);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, queryParams);
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0].total;

    return {
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // 3. Get Order Details by ID (Nested JSON)
  async getOrderById(id) {
    const [orderRows] = await pool.query(`
      SELECT o.id AS order_id, o.status, o.total_amount, o.created_at,
             c.id AS customer_id, c.full_name AS customer_name, c.email, c.phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [id]);

    if (orderRows.length === 0) return null;
    const order = orderRows[0];

    const [itemRows] = await pool.query(`
      SELECT p.product_name, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    return {
      order_id: order.order_id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      customer: {
        id: order.customer_id,
        full_name: order.customer_name,
        email: order.email,
        phone: order.phone
      },
      items: itemRows
    };
  },

  // 4. Update Status & Restore Stock if Cancelled
  async updateOrderStatus(id, newStatus) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orders] = await conn.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [id]);
      if (orders.length === 0) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
      }

      const currentStatus = orders[0].status;

      if (currentStatus === 'cancelled') {
        const err = new Error('An order that is already cancelled cannot change status again');
        err.statusCode = 400;
        throw err;
      }

      if (newStatus === 'cancelled') {
        // Hoàn lại kho cho từng item
        const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      await conn.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, id]);
      await conn.commit();
      return { message: 'Order status updated successfully', orderId: id, status: newStatus };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // 5. Delete Order & Restore Stock if not cancelled
  async deleteOrder(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [orders] = await conn.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [id]);
      if (orders.length === 0) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
      }

      const status = orders[0].status;
      if (status !== 'cancelled') {
        // Hoàn lại kho trước khi xóa nếu chưa hủy
        const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }
      }

      await conn.query('DELETE FROM orders WHERE id = ?', [id]); // ON DELETE CASCADE tự xóa order_items
      await conn.commit();
      return { message: 'Order deleted successfully' };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  // 6. Sales Revenue Analytics
  async getSalesAnalytics() {
    const [revRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS totalRevenue,
        COUNT(id) AS completedOrdersCount,
        COALESCE(AVG(total_amount), 0) AS averageOrderValue
      FROM orders
      WHERE status = 'completed'
    `);

    const [topProducts] = await pool.query(`
      SELECT p.id, p.product_name, SUM(oi.quantity) AS totalQuantitySold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.product_name
      ORDER BY totalQuantitySold DESC
      LIMIT 3
    `);

    return {
      totalRevenue: Number(revRows[0].totalRevenue),
      completedOrdersCount: Number(revRows[0].completedOrdersCount),
      averageOrderValue: Number(revRows[0].averageOrderValue),
      topSellingProducts: topProducts
    };
  },

  // 7. Customer Order History
  async getCustomerOrderHistory(customerId) {
    const [custRows] = await pool.query('SELECT id, full_name, email FROM customers WHERE id = ?', [customerId]);
    if (custRows.length === 0) return null;

    const [orders] = await pool.query(`
      SELECT id, status, total_amount, created_at
      FROM orders
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `, [customerId]);

    const [spentRows] = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS totalLifetimeSpent
      FROM orders
      WHERE customer_id = ? AND status = 'completed'
    `, [customerId]);

    return {
      customer: custRows[0],
      totalLifetimeSpent: Number(spentRows[0].totalLifetimeSpent),
      orders
    };
  }
};

module.exports = orderService;