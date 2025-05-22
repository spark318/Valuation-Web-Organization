import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Get the current auth token
export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `JWT ${token}` } : {};
};

// Set the auth token in localStorage and axios defaults
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    axios.defaults.headers.common['Authorization'] = `JWT ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/token/`, credentials);
    const { access, refresh } = response.data;
    setAuthToken(access);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/users/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Fetch user profile
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/me/`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};