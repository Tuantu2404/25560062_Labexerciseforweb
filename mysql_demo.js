require('dotenv').config();
const mysql = require('mysql2/promise');

// Khởi tạo Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function main() {
  try {
    console.log('Connecting to MySQL Database...');

    // 1. Tạo bảng 'categories' nếu chưa tồn tại
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("-> 'categories' table is ready.");

    // 2. Chèn dữ liệu sử dụng Prepared Statement
    const insertSql = `INSERT INTO categories (name, description) VALUES (?, ?)`;
    const [insertResult] = await pool.execute(insertSql, ['Food', 'Daily essentials']);
    console.log(`-> Inserted category ID: ${insertResult.insertId}`);

    // 3. Truy vấn dữ liệu
    const [rows] = await pool.execute('SELECT * FROM categories WHERE name = ?', ['Food']);
    console.log('-> Query result:', rows);

    // 4. Cập nhật dữ liệu
    const [updateResult] = await pool.execute(
      'UPDATE categories SET description = ? WHERE id = ?',
      ['Food, beverages and fresh food', insertResult.insertId]
    );
    console.log(`-> Number of updated rows: ${updateResult.affectedRows}`);

  } catch (error) {
    console.error('MySQL error:', error.message);
  } finally {
    await pool.end(); // Đóng kết nối sau khi hoàn thành
  }
}

main();