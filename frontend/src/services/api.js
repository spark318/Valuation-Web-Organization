import apiClient, { tokenStore } from './apiClient';

// Normalize axios errors to the response body (e.g. DRF field errors) when there is one.
const unwrap = (error) => error.response?.data || error.message;

export const loginUser = async (credentials) => {
  try {
    const { data } = await apiClient.post('/token/', credentials);
    tokenStore.set(data.access, data.refresh);
    return data;
  } catch (error) {
    throw unwrap(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const { data } = await apiClient.post('/auth/users/', userData);
    return data;
  } catch (error) {
    throw unwrap(error);
  }
};

export const fetchUserProfile = async () => {
  try {
    const { data } = await apiClient.get('/auth/users/me/');
    return data;
  } catch (error) {
    throw unwrap(error);
  }
};

export const logoutUser = () => tokenStore.clear();
