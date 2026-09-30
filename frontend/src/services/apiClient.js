import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

const redirectToLogin = () => {
  tokenStore.clear();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Access tokens expire after an hour. On a 401, trade the refresh token for a new access
// token once and replay the request; if that fails, the session is over.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }
    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      if (tokenStore.getAccess()) redirectToLogin();
      return Promise.reject(error);
    }
    try {
      original._retried = true;
      const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
      tokenStore.set(data.access);
      original.headers.Authorization = `JWT ${data.access}`;
      return apiClient.request(original);
    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
