/**
 * @jest-environment node
 */

const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockWhere = jest.fn().mockReturnThis();
const mockOrderBy = jest.fn().mockReturnThis();

const mockDoc = jest.fn().mockImplementation(() => ({
  update: mockUpdate,
  get: mockGet,
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockGet,
    }),
  },
}));

import {
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  getDashboardStats,
} from '@/lib/firestore/dashboardLeads';

const makeLead = (overrides: Record<string, unknown> = {}) => ({
  name: 'Jane Doe',
  email: 'jane@test.com',
  phone: '555-1234',
  status: 'new',
  urgency: 'warm',
  createdAt: '2026-03-05T10:00:00.000Z',
  updatedAt: '2026-03-05T10:00:00.000Z',
  conversationTranscript: [],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset chainable mock returns
  mockWhere.mockReturnThis();
  mockOrderBy.mockReturnThis();
});

describe('getAllLeads', () => {
  it('returns all leads', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'lead-1', data: () => makeLead() },
        { id: 'lead-2', data: () => makeLead({ name: 'John' }) },
      ],
    });
    const result = await getAllLeads();
    expect(result.leads).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('filters by status', async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: 'lead-1', data: () => makeLead({ status: 'contacted' }) }],
    });
    await getAllLeads({ status: 'contacted' });
    expect(mockWhere).toHaveBeenCalledWith('status', '==', 'contacted');
  });

  it('filters by urgency', async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: 'lead-1', data: () => makeLead({ urgency: 'hot' }) }],
    });
    await getAllLeads({ urgency: 'hot' });
    expect(mockWhere).toHaveBeenCalledWith('urgency', '==', 'hot');
  });

  it('filters by date range', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'lead-1', data: () => makeLead({ createdAt: '2026-03-01T10:00:00.000Z' }) },
        { id: 'lead-2', data: () => makeLead({ createdAt: '2026-03-05T10:00:00.000Z' }) },
        { id: 'lead-3', data: () => makeLead({ createdAt: '2026-03-10T10:00:00.000Z' }) },
      ],
    });
    const result = await getAllLeads({
      startDate: '2026-03-04T00:00:00.000Z',
      endDate: '2026-03-06T00:00:00.000Z',
    });
    expect(result.leads).toHaveLength(1);
    expect(result.leads[0].id).toBe('lead-2');
  });

  it('paginates results', async () => {
    const docs = Array.from({ length: 5 }, (_, i) => ({
      id: `lead-${i}`,
      data: () => makeLead({ name: `Lead ${i}` }),
    }));
    mockGet.mockResolvedValue({ docs });
    const result = await getAllLeads({ page: 2, limit: 2 });
    expect(result.leads).toHaveLength(2);
    expect(result.leads[0].id).toBe('lead-2');
    expect(result.leads[1].id).toBe('lead-3');
    expect(result.total).toBe(5);
  });

  it('returns empty array for no results', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    const result = await getAllLeads();
    expect(result.leads).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('orders by createdAt desc', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    await getAllLeads();
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });
});

describe('getLeadById', () => {
  it('returns lead when found', async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'lead-1',
        data: () => makeLead(),
      }),
      update: mockUpdate,
    });
    const result = await getLeadById('lead-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('lead-1');
    expect(result!.name).toBe('Jane Doe');
  });

  it('returns null when not found', async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
      update: mockUpdate,
    });
    const result = await getLeadById('nonexistent');
    expect(result).toBeNull();
  });
});

describe('updateLeadStatus', () => {
  it('updates status and timestamps', async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => makeLead({ status: 'new' }),
      }),
      update: mockUpdate,
    });
    await updateLeadStatus('lead-1', 'contacted');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'contacted',
        updatedAt: expect.any(String),
        statusChangedAt: expect.any(String),
      })
    );
  });

  it('does not set statusChangedAt when not transitioning from new', async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => makeLead({ status: 'contacted' }),
      }),
      update: mockUpdate,
    });
    await updateLeadStatus('lead-1', 'showing_booked');
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.status).toBe('showing_booked');
    expect(updateArg.statusChangedAt).toBeUndefined();
  });

  it('throws for invalid status', async () => {
    await expect(
      updateLeadStatus('lead-1', 'invalid' as never)
    ).rejects.toThrow('Invalid status');
  });

  it('throws when lead not found', async () => {
    mockDoc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
      update: mockUpdate,
    });
    await expect(updateLeadStatus('nonexistent', 'contacted')).rejects.toThrow(
      'Lead not found'
    );
  });
});

describe('getDashboardStats', () => {
  it('returns correct totals', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { data: () => makeLead({ status: 'new', urgency: 'hot' }) },
        { data: () => makeLead({ status: 'contacted', urgency: 'warm' }) },
        { data: () => makeLead({ status: 'closed', urgency: 'cold' }) },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.totalLeads).toBe(3);
  });

  it('counts leads this week correctly', async () => {
    const recent = new Date().toISOString();
    const old = '2020-01-01T00:00:00.000Z';
    mockGet.mockResolvedValue({
      docs: [
        { data: () => makeLead({ createdAt: recent }) },
        { data: () => makeLead({ createdAt: old }) },
        { data: () => makeLead({ createdAt: recent }) },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.leadsThisWeek).toBe(2);
  });

  it('breaks down by status', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { data: () => makeLead({ status: 'new' }) },
        { data: () => makeLead({ status: 'new' }) },
        { data: () => makeLead({ status: 'contacted' }) },
        { data: () => makeLead({ status: 'closed' }) },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.byStatus.new).toBe(2);
    expect(stats.byStatus.contacted).toBe(1);
    expect(stats.byStatus.closed).toBe(1);
    expect(stats.byStatus.showing_booked).toBe(0);
  });

  it('breaks down by urgency', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { data: () => makeLead({ urgency: 'hot' }) },
        { data: () => makeLead({ urgency: 'hot' }) },
        { data: () => makeLead({ urgency: 'cold' }) },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.byUrgency.hot).toBe(2);
    expect(stats.byUrgency.cold).toBe(1);
    expect(stats.byUrgency.warm).toBe(0);
  });

  it('calculates average response time', async () => {
    mockGet.mockResolvedValue({
      docs: [
        {
          data: () =>
            makeLead({
              createdAt: '2026-03-05T10:00:00.000Z',
              statusChangedAt: '2026-03-05T11:00:00.000Z', // 60 min
            }),
        },
        {
          data: () =>
            makeLead({
              createdAt: '2026-03-05T10:00:00.000Z',
              statusChangedAt: '2026-03-05T10:30:00.000Z', // 30 min
            }),
        },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.avgResponseTimeMinutes).toBe(45); // (60+30)/2
  });

  it('returns null avgResponseTime when no data', async () => {
    mockGet.mockResolvedValue({
      docs: [{ data: () => makeLead({ status: 'new' }) }],
    });
    const stats = await getDashboardStats();
    expect(stats.avgResponseTimeMinutes).toBeNull();
  });

  it('calculates conversion rate', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { data: () => makeLead({ status: 'closed' }) },
        { data: () => makeLead({ status: 'new' }) },
        { data: () => makeLead({ status: 'new' }) },
        { data: () => makeLead({ status: 'new' }) },
      ],
    });
    const stats = await getDashboardStats();
    expect(stats.conversionRate).toBe(25);
  });

  it('handles empty collection', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    const stats = await getDashboardStats();
    expect(stats.totalLeads).toBe(0);
    expect(stats.leadsThisWeek).toBe(0);
    expect(stats.conversionRate).toBe(0);
    expect(stats.avgResponseTimeMinutes).toBeNull();
  });
});
