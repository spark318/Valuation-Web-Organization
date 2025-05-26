import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import useAuthToken from '../hooks/useAuthToken';
import { loginUser, registerUser, fetchUserProfile, setAuthToken } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, setTokens, clearTokens } = useAuthToken();
  const initialized = useRef(false);

  // Configure Axios interceptor
//   useEffect(() => {
//     const interceptor = axios.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           console.log('401 error caught in interceptor'); // Debug log
//           clearTokens();
//           setUser(null);
//           setIsAuthenticated(false);
//           setAuthToken(null);
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.response.eject(interceptor);
//     };
//   }, [clearTokens]);

  const initializeAuth = async () => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('Initializing auth state...');
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      console.log('Found existing token, fetching user profile...');
      try {
        const userData = await fetchUserProfile();
        console.log('User profile fetched successfully:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log('No existing token found');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Login attempt with credentials:', credentials);
      const response = await loginUser(credentials);
      console.log('Login response received:', response);
      
      if (response && response.access) {
        console.log('Setting auth token and fetching user profile...');
        setAuthToken(response.access);
        const userData = await fetchUserProfile();
        console.log('User profile fetched after login:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error('Invalid response format from login');
      }
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      console.error('Error details:', error.message);
      setAuthToken(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration attempt with data:', userData);
      const response = await registerUser(userData);
      console.log('Registration successful, attempting auto-login...');
      return await login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout initiated');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    console.log('Logout completed');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
