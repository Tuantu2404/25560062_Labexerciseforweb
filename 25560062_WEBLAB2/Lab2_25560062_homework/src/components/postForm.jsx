import { useState } from 'react';

export default function PostForm({ onAddPost }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }

    setIsSubmitting(true);
    await onAddPost({ title, body, userId: 1 });
    setTitle('');
    setBody('');
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#fff',
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold', color: '#222' }}>
        New post
      </h3>
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxSizing: 'border-box',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxSizing: 'border-box',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px',
        }}
      >
        {isSubmitting ? 'Adding...' : 'Add post'}
      </button>
    </form>
  );
}