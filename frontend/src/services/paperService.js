import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        ...getAuthHeader(),
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
    const response = await axios.post(`${API_URL}/api/papers/${paperId}/report/`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to report paper');
  }
}; 