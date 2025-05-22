import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', // Remove /auth/ from base URL
});

// Function to handle login
export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/api/token/', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// Function to handle registration
export const registerUser = async (userData) => {
  // userData should be an object, e.g., { username, email, password }
  try {
    const response = await apiClient.post('/auth/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

// Function to fetch user profile
export const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found.');
    }
    const response = await apiClient.get('/auth/users/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetching user profile failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Fetching user profile failed');
  }
};

// You can add an interceptor to automatically add the token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; // Export the configured instance if you want to use it directly elsewhere