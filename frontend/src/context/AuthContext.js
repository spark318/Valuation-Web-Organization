import React, { createContext, useState, useContext, useEffect } from 'react';
import useAuthToken from '../hooks/useAuthToken';
import { loginUser, registerUser, fetchUserProfile } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, getRefreshToken, setTokens, clearTokens } = useAuthToken();

  // Configure Axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle 401 errors (e.g., token expired)
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [clearTokens]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const userData = await fetchUserProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          clearTokens();
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [getToken, clearTokens]);

  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      const { access, refresh } = response.data;
      
      // Set tokens and update Axios header
      setTokens(access, refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch and set user data
      const userData = await fetchUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerUser(userData);
      // Auto-login after successful registration
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
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    register,
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
