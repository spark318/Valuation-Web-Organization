import apiClient from './apiClient'; // Import the centralized apiClient

// Previous API_BASE_URL and local apiClient definition and interceptors are removed.

export const stockService = {
  // Get all stocks
  getStocks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/stocks/${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get stock details
  getStockDetails: (stockId) => apiClient.get(`/stocks/${stockId}/`),
  
  // Search stocks
  searchStocks: (query) => apiClient.get(`/stocks/search/?q=${encodeURIComponent(query)}`),
  
  // Get user's interested stocks (watchlist)
  getUserStocks: () => apiClient.get('/stocks/user/'),
  
  // Add stock to user's watchlist
  addStockInterest: (stockId, data = {}) => 
    apiClient.post(`/stocks/${stockId}/interest/`, data),
  
  // Remove stock from user's watchlist
  removeStockInterest: (stockId) => 
    apiClient.delete(`/stocks/${stockId}/remove/`),
  
  // Update user stock settings
  updateUserStock: (userStockId, data) => 
    apiClient.patch(`/stocks/user/${userStockId}/`, data),
  
  // Delete user stock
  deleteUserStock: (userStockId) => 
    apiClient.delete(`/stocks/user/${userStockId}/`),
  
  // Get user's watchlist summary
  getWatchlistSummary: () => apiClient.get('/stocks/user/summary/'),
  
  // Stock alerts
  getStockAlerts: () => apiClient.get('/stocks/alerts/'),
  
  // Create stock alert
  createStockAlert: (data) => apiClient.post('/stocks/alerts/', data),
  
  // Update stock alert
  updateStockAlert: (alertId, data) => 
    apiClient.patch(`/stocks/alerts/${alertId}/`, data),
  
  // Delete stock alert
  deleteStockAlert: (alertId) => 
    apiClient.delete(`/stocks/alerts/${alertId}/`),
};

export default stockService; 