import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Add auth token to requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const fetchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch papers');
  }
};

export const fetchPaperById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch paper details');
  }
};

export const uploadPaper = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/papers/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload paper');
  }
};

export const reportPaper = async (paperId) => {
  try {
    const response = await axios.post(`${API_URL}/api/papers/${paperId}/report/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to report paper');
  }
}; 