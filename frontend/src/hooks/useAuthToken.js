import { useState, useEffect } from 'react';

const useAuthToken = () => {
  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
  };

  const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return {
    getToken,
    getRefreshToken,
    setTokens,
    clearTokens,
  };
};

export default useAuthToken; 