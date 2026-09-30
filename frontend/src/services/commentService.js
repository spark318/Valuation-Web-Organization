import apiClient from './apiClient';

export const fetchComments = async (paperId) => {
  try {
    const { data } = await apiClient.get(`/papers/${paperId}/comments/`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createComment = async (paperId, content) => {
  try {
    const { data } = await apiClient.post(`/papers/${paperId}/comments/`, { content });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
