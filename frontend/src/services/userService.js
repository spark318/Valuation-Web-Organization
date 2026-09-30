import apiClient from './apiClient';

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