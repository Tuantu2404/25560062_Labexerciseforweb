// Lấy danh sách sản phẩm có phân trang (limit và skip)
export async function fetchProducts(limit = 12, skip = 0) {
  try {
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error("Không thể tải danh sách sản phẩm từ server.");
    }
    const data = await response.json();
    return data; // Trả về { products, total, skip, limit }
  } catch (error) {
    throw error;
  }
}

// Lấy chi tiết 1 sản phẩm theo ID
export async function fetchProductById(id) {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    if (!response.ok) {
      throw new Error("Không thể tải chi tiết sản phẩm.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}