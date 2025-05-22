import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = 'http://localhost:8000';

export const fetchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching papers:', error);
    throw error.response?.data || error.message;
  }
};

export const fetchPaperById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/papers/${id}/`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paper:', error);
    throw error.response?.data || error.message;
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
    console.error('Error uploading paper:', error);
    throw error.response?.data || error.message;
  }
}; 