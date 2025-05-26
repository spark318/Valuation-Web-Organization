import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Test function for debugging POST requests
export const testPostRequest = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/papers/test-post-debug/`, {
      test: 'data',
      message: 'Testing POST request'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Test POST successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test POST failed:', error);
    throw new Error(error.response?.data?.error || 'Test POST failed');
  }
};

export const fetchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/list/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch papers');
  }
};

export const fetchPaperById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/detail/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch paper details');
  }
};

export const uploadPaper = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/papers/upload/`, formData, {
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