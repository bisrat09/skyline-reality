/**
 * @jest-environment node
 */

const mockGetDashboardStats = jest.fn();

jest.mock('@/lib/firestore/dashboardLeads', () => ({
  getDashboardStats: (...args: unknown[]) => mockGetDashboardStats(...args),
}));

import { GET } from '@/app/api/dashboard/stats/route';
import { NextRequest } from 'next/server';

function createRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/dashboard/stats', {
    method: 'GET',
    headers,
  });
}

const mockStats = {
  totalLeads: 10,
  leadsThisWeek: 3,
  byStatus: { new: 4, contacted: 3, showing_booked: 2, closed: 1 },
  byUrgency: { hot: 3, warm: 5, cold: 2 },
  avgResponseTimeMinutes: 45,
  conversionRate: 10,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.DASHBOARD_PASSWORD = 'test-pass';
});

afterEach(() => {
  delete process.env.DASHBOARD_PASSWORD;
});

describe('GET /api/dashboard/stats', () => {
  it('returns 401 without auth header', async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong password', async () => {
    const res = await GET(
      createRequest({ authorization: 'Bearer wrong' })
    );
    expect(res.status).toBe(401);
  });

  it('returns stats data', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats);
    const res = await GET(
      createRequest({ authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.totalLeads).toBe(10);
    expect(data.leadsThisWeek).toBe(3);
    expect(data.byStatus.new).toBe(4);
    expect(data.byUrgency.hot).toBe(3);
    expect(data.avgResponseTimeMinutes).toBe(45);
    expect(data.conversionRate).toBe(10);
  });

  it('returns all status breakdowns', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats);
    const res = await GET(
      createRequest({ authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(data.byStatus).toEqual({
      new: 4,
      contacted: 3,
      showing_booked: 2,
      closed: 1,
    });
  });

  it('returns all urgency breakdowns', async () => {
    mockGetDashboardStats.mockResolvedValue(mockStats);
    const res = await GET(
      createRequest({ authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(data.byUrgency).toEqual({ hot: 3, warm: 5, cold: 2 });
  });

  it('handles null avgResponseTime', async () => {
    mockGetDashboardStats.mockResolvedValue({
      ...mockStats,
      avgResponseTimeMinutes: null,
    });
    const res = await GET(
      createRequest({ authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(data.avgResponseTimeMinutes).toBeNull();
  });

  it('returns 500 on error', async () => {
    mockGetDashboardStats.mockRejectedValue(new Error('DB error'));
    const res = await GET(
      createRequest({ authorization: 'Bearer test-pass' })
    );
    expect(res.status).toBe(500);
  });
});
