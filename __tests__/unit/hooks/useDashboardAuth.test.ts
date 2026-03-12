import { renderHook, act } from '@testing-library/react';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

const mockStorage: Record<string, string> = {};

// Mock fetch for server-side validation
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
  mockFetch.mockReset();
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

  it('login validates via dedicated login endpoint and stores password on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const { result } = renderHook(() => useDashboardAuth());
    let loginResult: { success: boolean; error: string | null } = { success: false, error: null };
    await act(async () => {
      loginResult = await result.current.login('my-pass');
    });
    expect(loginResult.success).toBe(true);
    expect(loginResult.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockStorage['dashboard_auth']).toBe('my-pass');
    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/login', {
      method: 'POST',
      headers: { Authorization: 'Bearer my-pass' },
    });
  });

  it('login returns invalid_password error on 401', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });
    const { result } = renderHook(() => useDashboardAuth());
    let loginResult: { success: boolean; error: string | null } = { success: false, error: null };
    await act(async () => {
      loginResult = await result.current.login('wrong-pass');
    });
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('invalid_password');
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockStorage['dashboard_auth']).toBeUndefined();
  });

  it('login returns rate_limited error on 429', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 429 });
    const { result } = renderHook(() => useDashboardAuth());
    let loginResult: { success: boolean; error: string | null } = { success: false, error: null };
    await act(async () => {
      loginResult = await result.current.login('my-pass');
    });
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('rate_limited');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login returns network_error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useDashboardAuth());
    let loginResult: { success: boolean; error: string | null } = { success: false, error: null };
    await act(async () => {
      loginResult = await result.current.login('my-pass');
    });
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('network_error');
    expect(result.current.isAuthenticated).toBe(false);
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
