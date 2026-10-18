export default function ProductCard({ title, price, thumbnail, onSelect, onAddToCart }) {
  return (
    <div 
      style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '8px', width: '200px', backgroundColor: '#fff', textAlign: 'left', cursor: 'pointer' }}
    >
      {/* Click vào ảnh hoặc tiêu đề để xem chi tiết */}
      <div onClick={onSelect}>
        <img src={thumbnail} alt={title} style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px' }} />
        <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px', color: '#333' }}>{title}</h3>
        <p style={{ margin: '5px 0', color: '#666' }}>Giá: <b>${price}</b></p>
      </div>

      <button 
        onClick={onAddToCart}
        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '8px' }}
      >
        Add to cart
      </button>  
    </div>
  );
}