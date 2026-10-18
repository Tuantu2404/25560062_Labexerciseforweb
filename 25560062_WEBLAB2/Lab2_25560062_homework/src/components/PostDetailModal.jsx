import { useEffect, useState } from 'react';
import { fetchPostComments } from '../Services/postService';

export default function PostDetailModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    if (post) {
      setLoadingComments(true);
      fetchPostComments(post.id)
        .then((data) => setComments(data.comments || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingComments(false));
    }
  }, [post]);

  if (!post) return null;

  // Cảm xúc Likes/Dislikes
  const likes = typeof post.reactions === 'object' ? post.reactions?.likes ?? 0 : post.reactions ?? 0;
  const dislikes = typeof post.reactions === 'object' ? post.reactions?.dislikes ?? 0 : 5;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          ✕
        </button>

        {/* Tiêu đề bài viết */}
        <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', fontWeight: 'bold', color: '#111827', paddingRight: '40px' }}>
          {post.title}
        </h2>

        {/* Thẻ Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#eef2ff',
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

        {/* Nội dung bài viết */}
        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', marginBottom: '16px', whiteSpace: 'pre-line' }}>
          {post.body}
        </p>

        {/* Tương tác Likes / Dislikes */}
        <div style={{ fontSize: '14px', color: '#6b7280', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
          👍 {likes} &nbsp;·&nbsp; 👎 {dislikes}
        </div>

        {/* Phần Bình luận */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
            Comments ({comments.length})
          </h3>

          {loadingComments ? (
            <p style={{ color: '#6366f1', fontSize: '14px' }}>⏳ Loading comments...</p>
          ) : comments.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px', italic: 'true' }}>No comments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#4f46e5', marginBottom: '4px' }}>
                    @{comment.user?.username || comment.user?.fullName || 'anonymous'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                    {comment.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}