import { renderHook, act } from '@testing-library/react';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => mockStorage[key] || null
  );
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      mockStorage[key] = value;
    }
  );
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => {
      delete mockStorage[key];
    }
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useDashboardAuth', () => {
  it('starts as not authenticated', () => {
    const { result } = renderHook(() => useDashboardAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('detects existing session on mount', () => {
    mockStorage['dashboard_auth'] = 'my-pass';
    const { result } = renderHook(() => useDashboardAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login stores password and sets authenticated', () => {
    const { result } = renderHook(() => useDashboardAuth());
    act(() => {
      result.current.login('my-pass');
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockStorage['dashboard_auth']).toBe('my-pass');
  });

  it('logout clears session', () => {
    mockStorage['dashboard_auth'] = 'my-pass';
    const { result } = renderHook(() => useDashboardAuth());
    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockStorage['dashboard_auth']).toBeUndefined();
  });

  it('getAuthHeaders returns Bearer header', () => {
    mockStorage['dashboard_auth'] = 'my-pass';
    const { result } = renderHook(() => useDashboardAuth());
    const headers = result.current.getAuthHeaders();
    expect(headers).toEqual({ Authorization: 'Bearer my-pass' });
  });

  it('getAuthHeaders returns empty when not authenticated', () => {
    const { result } = renderHook(() => useDashboardAuth());
    const headers = result.current.getAuthHeaders();
    expect(headers).toEqual({});
  });

  it('handleUnauthorized clears session', () => {
    mockStorage['dashboard_auth'] = 'my-pass';
    const { result } = renderHook(() => useDashboardAuth());
    act(() => {
      result.current.handleUnauthorized();
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
