import { useState, useEffect } from 'react';
import './App.css';
import ProductCard from './Components/ProductCard';
import { fetchProducts, fetchProductById } from './Services/productApi';

export default function App() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  // Gọi API lấy danh sách sản phẩm mỗi khi page thay đổi
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const skip = (page - 1) * limit;
        const data = await fetchProducts(limit, skip);
        setProducts(data.products);
        setTotal(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  // Click vào sản phẩm để xem chi tiết từ API GET /products/{id}
  const handleSelectProduct = async (id) => {
    try {
      const detail = await fetchProductById(id);
      setSelectedProduct(detail);
    } catch (err) {
      alert("Không thể tải chi tiết sản phẩm!");
    }
  };

  // Thêm vào giỏ hàng (tăng số lượng nếu đã có)
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Tính tổng tiền giỏ hàng (Total)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const totalPages = Math.ceil(total / limit);

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</h2>;
  if (error) return <h2 style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Lỗi: {error}</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Cửa hàng API (DummyJSON)</h1>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Danh sách sản phẩm & Phân trang */}
        <div style={{ flex: 2 }}>
          <h2>Danh sách sản phẩm</h2>
          <p style={{ color: '#666', marginBottom: '15px' }}>Tổng số sản phẩm từ hệ thống: <b>{total}</b></p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                thumbnail={product.thumbnail}
                onSelect={() => handleSelectProduct(product.id)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>

          {/* Nút Previous / Next */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              style={{ padding: '8px 16px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              style={{ padding: '8px 16px', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>

        {/* Chi tiết sản phẩm & Giỏ hàng */}
        <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
          {selectedProduct && (
            <div style={{ marginBottom: '30px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              <h3>Chi tiết sản phẩm</h3>
              <p><b>Tên:</b> {selectedProduct.title}</p>
              <p><b>Mô tả:</b> {selectedProduct.description}</p>
              <p><b>Đánh giá:</b> ⭐ {selectedProduct.rating}</p>
              <p><b>Kho còn:</b> {selectedProduct.stock}</p>
              <button onClick={() => setSelectedProduct(null)} style={{ fontSize: '12px', cursor: 'pointer' }}>Đóng</button>
            </div>
          )}

          <h2>Giỏ hàng 🛒</h2>
          {cart.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <div>
              <ul style={{ paddingLeft: '20px' }}>
                {cart.map((item) => (
                  <li key={item.id} style={{ marginBottom: '10px' }}>
                    {item.title} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <hr />
              {/* Hiển thị tổng tiền giỏ hàng */}
              <h3>Tổng tiền: ${totalPrice.toFixed(2)}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}