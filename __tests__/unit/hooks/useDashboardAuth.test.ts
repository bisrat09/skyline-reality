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

  it('login validates server-side and stores password on success', async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useDashboardAuth());
    let success: boolean = false;
    await act(async () => {
      success = await result.current.login('my-pass');
    });
    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockStorage['dashboard_auth']).toBe('my-pass');
    expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/stats', {
      headers: { Authorization: 'Bearer my-pass' },
    });
  });

  it('login returns false on invalid password', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useDashboardAuth());
    let success: boolean = true;
    await act(async () => {
      success = await result.current.login('wrong-pass');
    });
    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockStorage['dashboard_auth']).toBeUndefined();
  });

  it('login returns false on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useDashboardAuth());
    let success: boolean = true;
    await act(async () => {
      success = await result.current.login('my-pass');
    });
    expect(success).toBe(false);
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
