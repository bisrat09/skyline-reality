'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'dashboard_auth';

export type LoginError = 'invalid_password' | 'rate_limited' | 'network_error' | null;

interface LoginResult {
  success: boolean;
  error: LoginError;
}

interface UseDashboardAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<LoginResult>;
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

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/dashboard/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEY, password);
        setIsAuthenticated(true);
        return { success: true, error: null };
      }
      if (res.status === 429) {
        return { success: false, error: 'rate_limited' };
      }
      return { success: false, error: 'invalid_password' };
    } catch {
      return { success: false, error: 'network_error' };
    }
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
