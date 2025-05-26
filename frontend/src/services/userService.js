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
          const response = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });
          const newToken = response.data.access;
          localStorage.setItem('accessToken', newToken);
          
          // Retry the original request
          error.config.headers.Authorization = `JWT ${newToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get current user profile
  getProfile: () => apiClient.get('/users/profile/'),
  
  // Update user profile
  updateProfile: (data) => apiClient.patch('/users/profile/', data),
  
  // Get user details by ID
  getUserDetails: (userId) => apiClient.get(`/users/${userId}/`),
  
  // Follow a user
  followUser: (userId) => apiClient.post(`/users/${userId}/follow/`),
  
  // Unfollow a user
  unfollowUser: (userId) => apiClient.delete(`/users/${userId}/unfollow/`),
  
  // Get user's followers
  getFollowers: (userId) => apiClient.get(`/users/${userId}/followers/`),
  
  // Get users that user is following
  getFollowing: (userId) => apiClient.get(`/users/${userId}/following/`),
  
  // Search users
  searchUsers: (query) => apiClient.get(`/users/search/?q=${encodeURIComponent(query)}`),
};

export default userService; 