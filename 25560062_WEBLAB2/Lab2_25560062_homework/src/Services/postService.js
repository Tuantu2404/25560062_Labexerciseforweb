const BASE_URL = 'https://dummyjson.com/posts';

export const fetchPosts = async (limit = 10, skip = 0) => {
  try {
    const res = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
    if (!res.ok) throw new Error('Không thể tải danh sách bài viết');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const searchPosts = async (query) => {
  try {
    const res = await fetch(`${BASE_URL}/search?q=${query}`);
    if (!res.ok) throw new Error('Lỗi khi tìm kiếm bài viết');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const fetchPostComments = async (postId) => {
  try {
    const res = await fetch(`${BASE_URL}/${postId}/comments`);
    if (!res.ok) throw new Error('Không thể tải bình luận');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const res = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Không thể thêm bài viết');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deletePostApi = async (postId) => {
  try {
    const res = await fetch(`${BASE_URL}/${postId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Cannot delete post');
    return await res.json();
  } catch (error) {
    throw error;
  }
};