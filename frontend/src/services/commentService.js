import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = 'http://localhost:8000';

export const fetchComments = async (paperId) => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/${paperId}/comments/`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error.response?.data || error.message;
  }
};

export const createComment = async (paperId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/papers/${paperId}/comments/`,
      { content },
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error.response?.data || error.message;
  }
}; 