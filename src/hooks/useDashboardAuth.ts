'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'dashboard_auth';

interface UseDashboardAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  handleUnauthorized: () => void;
}

export function useDashboardAuth(): UseDashboardAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((password: string) => {
    sessionStorage.setItem(STORAGE_KEY, password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const password = sessionStorage.getItem(STORAGE_KEY);
    return password ? { Authorization: `Bearer ${password}` } : {};
  }, []);

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAuthHeaders,
    handleUnauthorized,
  };
}
