import { renderHook, act } from '@testing-library/react';
import { useVoiceCalls } from '@/hooks/useVoiceCalls';

const mockCalls = [
  { id: 'vc-1', vapiCallId: 'v1', status: 'ended', createdAt: '2026-03-08' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useVoiceCalls', () => {
  it('starts with loading state', () => {
    const { result } = renderHook(() => useVoiceCalls());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.calls).toEqual([]);
  });

  it('fetches calls and sets data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ calls: mockCalls }),
    });

    const { result } = renderHook(() => useVoiceCalls());

    await act(async () => {
      await result.current.fetchCalls({ Authorization: 'Bearer test' });
    });

    expect(result.current.calls).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useVoiceCalls());

    await act(async () => {
      await result.current.fetchCalls({ Authorization: 'Bearer test' });
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('calls onUnauthorized on 401 instead of setting error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const onUnauthorized = jest.fn();
    const { result } = renderHook(() => useVoiceCalls({ onUnauthorized }));

    await act(async () => {
      await result.current.fetchCalls({ Authorization: 'Bearer expired' });
    });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    // Error should NOT be set — the page will re-render to login
    expect(result.current.error).toBeNull();
  });
});
