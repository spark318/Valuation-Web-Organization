import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/papers/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchPaperById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/papers/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 