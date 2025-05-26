import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  // console.log('Requesting URL:', config.baseURL + config.url); // Removed debugging log
  return config;
});

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Use a temporary, clean axios instance for the refresh token request
          // to avoid circular dependency or issues with the interceptor itself.
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });
          const newToken = refreshResponse.data.access;
          localStorage.setItem('accessToken', newToken);
          
          // Retry the original request with the new token
          error.config.headers.Authorization = `JWT ${newToken}`;
          return apiClient.request(error.config); // Use the original apiClient to retry
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.error("Session expired or refresh token invalid. Redirecting to login.", refreshError);
          // Prevent further actions if already redirecting or in a non-browser env
          if (typeof window !== 'undefined' && window.location) {
            // To avoid redirect loops if /login itself causes a 401
            if (window.location.pathname !== '/login') {
                 window.location.href = '/login';
            }
          }
          return Promise.reject(refreshError); // Important to reject the promise
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.error("No refresh token found. Redirecting to login.");
        if (typeof window !== 'undefined' && window.location) {
            if (window.location.pathname !== '/login') {
                 window.location.href = '/login';
            }
        }
        return Promise.reject(error); // Reject the original error
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 