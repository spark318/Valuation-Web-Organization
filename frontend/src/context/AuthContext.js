import React, { createContext, useState, useContext, useEffect } from 'react';
import useAuthToken from '../hooks/useAuthToken';
import { loginUser, registerUser, fetchUserProfile, setAuthToken } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, setTokens, clearTokens } = useAuthToken();

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

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth state');
      const token = getToken();
      if (token) {
        console.log('Found existing token, attempting to fetch profile');
        try {
          setAuthToken(token);
          const userData = await fetchUserProfile();
          console.log('Successfully fetched user profile');
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Failed to fetch user profile during init:', error.message);
          clearTokens();
          setAuthToken(null);
        }
      } else {
        console.log('No existing token found');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [getToken, clearTokens]);

  const login = async (credentials) => {
    try {
      console.log('Login attempt in AuthContext');
      
      // First, get the tokens
      const response = await loginUser(credentials);
      console.log('Login response received');
      
      const { access: accessToken, refresh: refreshToken } = response.data;
      console.log('Tokens extracted from response');

      // Set the tokens in localStorage and state
      setTokens(accessToken, refreshToken);
      console.log('Tokens set in localStorage');

      // Set the authorization header for subsequent requests
      setAuthToken(accessToken);
      console.log('Authorization header set');

      // Now fetch the user profile
      console.log('Fetching user profile after login');
      const userData = await fetchUserProfile();
      console.log('User profile received');
      
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Login process completed successfully');

      return userData;
    } catch (error) {
      console.log('Login failed in AuthContext:', error.message);
      console.log('Error details:', error.response?.data);
      clearTokens();
      setAuthToken(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration attempt');
      const response = await registerUser(userData);
      console.log('Registration successful, proceeding to auto-login');
      return await login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      console.log('Registration failed:', error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout initiated');
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    console.log('Logout completed');
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
