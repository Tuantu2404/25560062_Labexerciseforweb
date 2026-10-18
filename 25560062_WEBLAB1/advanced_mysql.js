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

// Question 2 Helper Function: Tìm kiếm sản phẩm theo từ khóa (dùng Prepared Statement với LIKE)
async function searchProductsByKeyword(keyword) {
  const sql = `SELECT * FROM products WHERE name LIKE ?`;
  const [rows] = await pool.execute(sql, [`%${keyword}%`]);
  return rows;
}

async function main() {
  try {
    console.log("=== BẮT ĐẦU THỰC THI CÁC CÂU HỎI TRUY VẤN MYSQL ===\n");

    // -----------------------------------------------------------------
    // Question 1: Filter & Sort (Lọc giá >= 500k, số lượng > 0, xếp giảm dần)
    // -----------------------------------------------------------------
    console.log("--- Question 1: Products >= 500,000 VND and Quantity > 0 (Sorted DESC) ---");
    const q1Sql = `
      SELECT * FROM products 
      WHERE price >= 500000 AND quantity > 0 
      ORDER BY price DESC
    `;
    const [q1Rows] = await pool.execute(q1Sql);
    console.table(q1Rows);

    // -----------------------------------------------------------------
    // Question 2: Wildcard / LIKE search (Tìm sản phẩm chứa "Gaming" hoặc "Wireless")
    // -----------------------------------------------------------------
    console.log("\n--- Question 2: Search products containing 'Gaming' or 'Wireless' ---");
    const gamingProducts = await searchProductsByKeyword('Gaming');
    const wirelessProducts = await searchProductsByKeyword('Wireless');
    
    // Gộp kết quả và loại bỏ trùng lặp nếu có
    const combinedQ2 = [...gamingProducts, ...wirelessProducts];
    console.table(combinedQ2);

    // -----------------------------------------------------------------
    // Question 3: Aggregate functions (SUM, AVG, COUNT trên bảng products)
    // -----------------------------------------------------------------
    console.log("\n--- Question 3: Aggregate statistics across all items ---");
    const q3Sql = `
      SELECT 
        SUM(quantity) AS total_stock_quantity,
        ROUND(AVG(price), 2) AS average_price,
        COUNT(*) AS total_number_of_items
      FROM products
    `;
    const [q3Rows] = await pool.execute(q3Sql);
    console.table(q3Rows);

    // -----------------------------------------------------------------
    // Question 4: Category statistics (GROUP BY & HAVING)
    // Thống kê theo Danh mục có Tổng giá trị tồn kho (price * quantity) > 10,000,000 VNĐ
    // -----------------------------------------------------------------
    console.log("\n--- Question 4: Category statistics with HAVING total_inventory_value > 10,000,000 ---");
    const minInventoryValue = 10000000; // Ngưỡng giá trị tồn kho (ví dụ: 10 triệu)
    const q4Sql = `
      SELECT 
        category,
        COUNT(*) AS total_items,
        SUM(price * quantity) AS total_inventory_value
      FROM products
      GROUP BY category
      HAVING total_inventory_value > ?
    `;
    const [q4Rows] = await pool.execute(q4Sql, [minInventoryValue]);
    console.table(q4Rows);

  } catch (error) {
    console.error('Lỗi khi thực thi MySQL:', error.message);
  } finally {
    await pool.end(); // Đóng kết nối
  }
}

main();