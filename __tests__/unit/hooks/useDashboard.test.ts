import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboard } from '@/hooks/useDashboard';

const mockLeads = [
  { id: 'l1', name: 'Jane', email: 'jane@test.com', status: 'new', urgency: 'hot' },
  { id: 'l2', name: 'John', email: 'john@test.com', status: 'contacted', urgency: 'warm' },
];

const mockStats = {
  totalLeads: 2,
  leadsThisWeek: 1,
  byStatus: { new: 1, contacted: 1, showing_booked: 0, closed: 0 },
  byUrgency: { hot: 1, warm: 1, cold: 0 },
  avgResponseTimeMinutes: 30,
  conversionRate: 0,
};

const mockGetAuthHeaders = jest.fn().mockReturnValue({ Authorization: 'Bearer test' });
const mockOnUnauthorized = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

function mockFetchSuccess() {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('/stats')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStats),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ leads: mockLeads, total: 2 }),
    });
  });
}

describe('useDashboard', () => {
  it('fetches leads and stats on mount', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leads).toHaveLength(2);
    expect(result.current.stats).toEqual(mockStats);
  });

  it('passes auth headers to fetch', async () => {
    mockFetchSuccess();
    renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(calls[0][1].headers).toEqual({ Authorization: 'Bearer test' });
  });

  it('calls onUnauthorized on 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(mockOnUnauthorized).toHaveBeenCalled();
    });
  });

  it('sets error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('updates lead status and refetches', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Reset to track the PATCH call
    (global.fetch as jest.Mock).mockClear();
    mockFetchSuccess();
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true }) })
    );

    await act(async () => {
      await result.current.updateLeadStatus('l1', 'contacted');
    });

    const patchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(patchCall[0]).toContain('/api/dashboard/leads/l1');
    expect(patchCall[1].method).toBe('PATCH');
  });

  it('sets expandedLeadId', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setExpandedLeadId('l1');
    });
    expect(result.current.expandedLeadId).toBe('l1');

    act(() => {
      result.current.setExpandedLeadId(null);
    });
    expect(result.current.expandedLeadId).toBeNull();
  });

  it('updates filters', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() =>
      useDashboard({
        getAuthHeaders: mockGetAuthHeaders,
        onUnauthorized: mockOnUnauthorized,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFilters({ status: 'new' });
    });

    expect(result.current.filters).toEqual({ status: 'new' });
  });
});
