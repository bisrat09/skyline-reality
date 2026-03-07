/**
 * @jest-environment node
 */

const mockGetAllLeads = jest.fn();
const mockUpdateLeadStatus = jest.fn();

jest.mock('@/lib/firestore/dashboardLeads', () => ({
  getAllLeads: (...args: unknown[]) => mockGetAllLeads(...args),
  updateLeadStatus: (...args: unknown[]) => mockUpdateLeadStatus(...args),
}));

import { GET } from '@/app/api/dashboard/leads/route';
import { PATCH } from '@/app/api/dashboard/leads/[id]/route';
import { NextRequest } from 'next/server';

function createGetRequest(
  query: Record<string, string> = {},
  headers: Record<string, string> = {}
) {
  const url = new URL('http://localhost:3000/api/dashboard/leads');
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString(), { method: 'GET', headers });
}

function createPatchRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new NextRequest('http://localhost:3000/api/dashboard/leads/lead-1', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.DASHBOARD_PASSWORD = 'test-pass';
});

afterEach(() => {
  delete process.env.DASHBOARD_PASSWORD;
});

describe('GET /api/dashboard/leads', () => {
  it('returns 401 without auth header', async () => {
    const res = await GET(createGetRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong password', async () => {
    const res = await GET(
      createGetRequest({}, { authorization: 'Bearer wrong' })
    );
    expect(res.status).toBe(401);
  });

  it('returns leads list', async () => {
    mockGetAllLeads.mockResolvedValue({
      leads: [
        { id: 'l1', name: 'Jane', email: 'jane@test.com', status: 'new' },
      ],
      total: 1,
    });
    const res = await GET(
      createGetRequest({}, { authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.leads).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('passes filter params to getAllLeads', async () => {
    mockGetAllLeads.mockResolvedValue({ leads: [], total: 0 });
    await GET(
      createGetRequest(
        { status: 'contacted', urgency: 'hot', page: '2', limit: '10' },
        { authorization: 'Bearer test-pass' }
      )
    );
    expect(mockGetAllLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'contacted',
        urgency: 'hot',
        page: 2,
        limit: 10,
      })
    );
  });

  it('passes date range params', async () => {
    mockGetAllLeads.mockResolvedValue({ leads: [], total: 0 });
    await GET(
      createGetRequest(
        { startDate: '2026-03-01', endDate: '2026-03-07' },
        { authorization: 'Bearer test-pass' }
      )
    );
    expect(mockGetAllLeads).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-03-01',
        endDate: '2026-03-07',
      })
    );
  });

  it('returns default page and limit', async () => {
    mockGetAllLeads.mockResolvedValue({ leads: [], total: 0 });
    const res = await GET(
      createGetRequest({}, { authorization: 'Bearer test-pass' })
    );
    const data = await res.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
  });

  it('returns 500 on error', async () => {
    mockGetAllLeads.mockRejectedValue(new Error('DB error'));
    const res = await GET(
      createGetRequest({}, { authorization: 'Bearer test-pass' })
    );
    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/dashboard/leads/[id]', () => {
  const params = Promise.resolve({ id: 'lead-1' });

  it('returns 401 without auth header', async () => {
    const res = await PATCH(createPatchRequest({ status: 'contacted' }), {
      params,
    });
    expect(res.status).toBe(401);
  });

  it('updates lead status', async () => {
    mockUpdateLeadStatus.mockResolvedValue(undefined);
    const res = await PATCH(
      createPatchRequest(
        { status: 'contacted' },
        { authorization: 'Bearer test-pass' }
      ),
      { params }
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.newStatus).toBe('contacted');
  });

  it('returns 400 for invalid status', async () => {
    const res = await PATCH(
      createPatchRequest(
        { status: 'invalid' },
        { authorization: 'Bearer test-pass' }
      ),
      { params }
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing status', async () => {
    const res = await PATCH(
      createPatchRequest({}, { authorization: 'Bearer test-pass' }),
      { params }
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing lead', async () => {
    mockUpdateLeadStatus.mockRejectedValue(new Error('Lead not found: lead-1'));
    const res = await PATCH(
      createPatchRequest(
        { status: 'contacted' },
        { authorization: 'Bearer test-pass' }
      ),
      { params }
    );
    expect(res.status).toBe(404);
  });

  it('returns 500 on unexpected error', async () => {
    mockUpdateLeadStatus.mockRejectedValue(new Error('DB connection failed'));
    const res = await PATCH(
      createPatchRequest(
        { status: 'contacted' },
        { authorization: 'Bearer test-pass' }
      ),
      { params }
    );
    expect(res.status).toBe(500);
  });
});
