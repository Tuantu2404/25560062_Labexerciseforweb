const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Tt0862081062@', // Update with your MySQL password
  database: 'store_transaction_db'
};

async function executeOrderTransaction(customerId, productId, quantity) {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    await conn.beginTransaction();

    // Step 1: Check customer balance & product stock
    const [[customer]] = await conn.execute(
      'SELECT balance FROM customers WHERE id = ? FOR UPDATE',
      [customerId]
    );
    const [[product]] = await conn.execute(
      'SELECT price, stock FROM products WHERE id = ? FOR UPDATE',
      [productId]
    );

    if (!customer) throw new Error('Customer not found');
    if (!product) throw new Error('Product not found');

    const totalAmount = product.price * quantity;
    if (customer.balance < totalAmount) throw new Error('Insufficient balance');
    if (product.stock < quantity) throw new Error('Out of stock');

    // Step 2: Deduct balance from customer
    await conn.execute(
      'UPDATE customers SET balance = balance - ? WHERE id = ?',
      [totalAmount, customerId]
    );

    // Step 3: Deduct stock from product
    await conn.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [quantity, productId]
    );

    // Step 4: Insert order record
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (customer_id, total_amount, created_at) VALUES (?, ?, NOW())',
      [customerId, totalAmount]
    );

    // Step 5: Insert order item record
    await conn.execute(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderResult.insertId, productId, quantity, product.price]
    );

    await conn.commit();
    return { success: true, orderId: orderResult.insertId, totalAmount };

  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.end();
  }
}

// Test Execution
async function runTest() {
  try {
    const result = await executeOrderTransaction(1, 1, 2);
    console.log('Order processed successfully:', result);
  } catch (err) {
    console.error('Transaction failed:', err.message);
  }
}

runTest();