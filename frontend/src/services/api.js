import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle login
export const loginUser = (credentials) => {
  console.log('Login attempt with credentials:', credentials);
  return api.post('/api/token/', {
    username: credentials.username,
    password: credentials.password
  });
};

// Function to handle registration
export const registerUser = (userData) => {
  return api.post('/auth/users/', userData);
};

// Function to set auth token
export const setAuthToken = (token) => {
  console.log('Setting auth token:', token ? 'Token present' : 'No token');
  if (token) {
    localStorage.setItem('accessToken', token);
    console.log('Token stored in localStorage');
  } else {
    console.log('Removing token from localStorage');
    localStorage.removeItem('accessToken');
  }
};

// Function to get current token
const getToken = () => {
  const token = localStorage.getItem('accessToken');
  console.log('Getting token from localStorage:', token ? 'Token present' : 'No token');
  return token;
};

// Function to refresh token
const refreshToken = async () => {
  console.log('Attempting token refresh');
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    console.log('No refresh token available');
    throw new Error('No refresh token available');
  }

  try {
    console.log('Sending refresh token request');
    const response = await api.post('/api/token/refresh/', { refresh });
    const { access } = response.data;
    console.log('Received new access token');
    setAuthToken(access);
    return access;
  } catch (error) {
    console.log('Token refresh failed:', error.message);
    console.log('Clearing tokens due to refresh failure');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Function to fetch user profile with automatic token refresh
export const fetchUserProfile = async () => {
  console.log('Fetching user profile');
  const token = getToken();
  if (!token) {
    console.log('No access token available for profile fetch');
    throw new Error('No access token available');
  }

  try {
    console.log('Making profile request with token');
    const response = await api.get('/auth/users/me/', {
      headers: {
        Authorization: `JWT ${token}`
      }
    });
    console.log('Profile request successful');
    return response;
  } catch (error) {
    console.log('Profile request failed:', error.response?.status);
    if (error.response?.status === 401) {
      console.log('Token expired, attempting refresh');
      try {
        const newToken = await refreshToken();
        console.log('Token refreshed, retrying profile request');
        return await api.get('/auth/users/me/', {
          headers: {
            Authorization: `JWT ${newToken}`
          }
        });
      } catch (refreshError) {
        console.log('Token refresh failed during profile fetch:', refreshError.message);
        throw refreshError;
      }
    }
    throw error;
  }
};