export default function PostCard({ post, onDelete, onClick }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Deleting post? "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  // Lấy thông tin reactions (likes và dislikes)
  const likes = typeof post.reactions === 'object' ? post.reactions?.likes ?? 0 : post.reactions ?? 0;
  const dislikes = typeof post.reactions === 'object' ? post.reactions?.dislikes ?? 0 : 5;

  return (
    <div
      onClick={() => onClick(post)}
      style={{
        backgroundColor: '#fff',
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#111' }}>
        {post.title}
      </h3>
      
      {/* Hiển thị Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                background: '#eef2ff',
                color: '#4f46e5',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                marginRight: '6px',
                marginBottom: '4px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Hiển thị lượt tương tác Likes / Dislikes */}
      <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>
        👍 {likes} &nbsp;·&nbsp; 👎 {dislikes}
      </div>

      {/* Nút View và Delete */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(post);
          }}
          style={{
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          View
        </button>
        <button
          onClick={handleDelete}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}