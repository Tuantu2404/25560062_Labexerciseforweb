const sampleProducts = [
  { id: 1, name: "Chuột không dây", price: 15.99, category: "Phụ kiện", image: "https://product.hstatic.net/200000420363/product/mo_du_lm106g_de-600x600_a052a53b8db34fb7ab63652773951c83_compact.jpg" },
  { id: 2, name: "Bàn phím cơ", price: 45.00, category: "Phụ kiện", image: "https://product.hstatic.net/200000420363/product/ban-phim-co-logitech-g413-tkl-se-mechanical-920-010448-wireless-den_a140cd23a90f46729beaef9e7108f543_compact.jpg" },
  { id: 3, name: "Cáp sạc Type-C", price: 9.50, category: "Phụ kiện", image: "https://placehold.co/150" },
  { id: 4, name: "Tai nghe Bluetooth", price: 29.99, category: "Âm thanh", image: "https://placehold.co/150" },
  { id: 5, name: "Loa mini", price: 19.99, category: "Âm thanh", image: "https://placehold.co/150" },
  { id: 6, name: "Đế tản nhiệt laptop", price: 25.00, category: "Laptop", image: "https://placehold.co/150" }
];

// Hàm giả lập fetch dữ liệu có độ trễ 1 giây để hiện chữ "Loading..."
export function fakeFetchProducts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleProducts);
    }, 1000);
  });
}