import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/auth/', // Fallback if .env is not set
});

// Function to handle login
export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('jwt/create/', { username, password });
    // Assuming your API returns tokens in response.data
    // e.g., response.data.access and response.data.refresh
    return response.data;
  } catch (error) {
    // Handle or throw error to be caught by the component
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// Function to handle registration
export const registerUser = async (userData) => {
  // userData should be an object, e.g., { username, email, password }
  try {
    const response = await apiClient.post('users/', userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

// Optional: Function to fetch user profile (example)
export const fetchUserProfile = async () => {
  try {
    // Ensure the token is set in Authorization header for this request
    // This can be done globally in your AuthContext or per request
    const token = localStorage.getItem('accessToken'); // Or however you store it
    if (!token) {
      throw new Error('No access token found.');
    }
    const response = await apiClient.get('users/me/', {
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
    const token = localStorage.getItem('accessToken'); // Or your preferred way of storing tokens
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