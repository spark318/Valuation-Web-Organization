import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchUserProfile, logoutUser } from '../services/api';
import { tokenStore } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from a stored token on first load.
  useEffect(() => {
    if (!tokenStore.getAccess()) {
      setIsLoading(false);
      return;
    }
    fetchUserProfile()
      .then(setUser)
      .catch(() => logoutUser())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials) => {
    try {
      await loginUser(credentials);
      const userData = await fetchUserProfile();
      setUser(userData);
      return userData;
    } catch (error) {
      logoutUser();
      throw error;
    }
  };

  const register = async (userData) => {
    await registerUser(userData);
    return login({ username: userData.username, password: userData.password });
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
