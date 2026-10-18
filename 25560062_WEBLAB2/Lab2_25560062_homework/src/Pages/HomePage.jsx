import { useState, useEffect } from 'react';
import { fetchPosts, searchPosts, createPost, deletePostApi } from '../Services/postService';
import { useDebounce } from '../hooks/useDebounce';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import PostDetailModal from '../components/PostDetailModal';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (debouncedSearch.trim()) {
          data = await searchPosts(debouncedSearch);
        } else {
          data = await fetchPosts(limit, skip);
        }
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message || 'Đã có lỗi xảy ra!');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [skip, debouncedSearch]);

  const handleAddPost = async (newPostData) => {
    try {
      const created = await createPost(newPostData);
      setPosts((prevPosts) => [created, ...prevPosts]);
      alert('Posting successful!');
    } catch (err) {
      alert('Lỗi khi thêm bài viết: ' + err.message);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePostApi(id);
    } catch (err) {
      console.warn('API xóa báo lỗi (bình thường với bài viết mới thêm do dùng Mock API):', err.message);
    } finally {
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== id));
      alert('Post deleted!');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      {/* Tiêu đề chính */}
      <h1 style={{ color: '#6366f1', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        Mini Blog Manager
      </h1>

      {/* Form thêm bài viết */}
      <PostForm onAddPost={handleAddPost} />

      {/* Ô Tìm kiếm */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSkip(0);
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxSizing: 'border-box',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: '#fff',
            color: '#111827',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        />
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#6366f1' }}>⏳ Đang tải dữ liệu...</p>}
      {error && <p style={{ textAlign: 'center', color: 'red' }}>⚠️ {error}</p>}

      {/* Danh sách bài viết */}
      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Không tìm thấy bài viết nào.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
                onClick={setSelectedPost}
              />
            ))
          )}

          {/* Phân trang */}
          {!debouncedSearch.trim() && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingBottom: '30px' }}>
              <button
                disabled={skip === 0}
                onClick={() => setSkip((prev) => Math.max(0, prev - limit))}
                style={{ padding: '8px 16px', cursor: skip === 0 ? 'not-allowed' : 'pointer', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: skip === 0 ? '#9ca3af' : '#4f46e5'  }}
              >
                ◀ Previous
              </button>
              <span style={{ fontSize: '14px', color: '#555' }}>
                Trang {Math.floor(skip / limit) + 1} / {Math.ceil(total / limit) || 1}
              </span>
              <button
                disabled={skip + limit >= total}
                onClick={() => setSkip((prev) => prev + limit)}
                style={{ padding: '8px 16px', cursor: skip + limit >= total ? 'not-allowed' : 'pointer', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', color: skip === 0 ? '#9ca3af' : '#4f46e5', }}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết */}
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </div>
  );
}