/**
 * @jest-environment node
 */
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

const mockGetAllVoiceCalls = jest.fn();

jest.mock('@/lib/firestore/voiceCalls', () => ({
  getAllVoiceCalls: (...args: unknown[]) => mockGetAllVoiceCalls(...args),
}));

import { GET } from '@/app/api/dashboard/voice-calls/route';
import { NextRequest } from 'next/server';

function createRequest(
  headers: Record<string, string> = {},
  params = ''
) {
  return new NextRequest(
    `http://localhost:3000/api/dashboard/voice-calls${params}`,
    { method: 'GET', headers }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.DASHBOARD_PASSWORD = 'test-pass';
});

describe('GET /api/dashboard/voice-calls', () => {
  it('returns 401 without auth', async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('returns voice calls with valid auth', async () => {
    mockGetAllVoiceCalls.mockResolvedValue([
      { id: 'vc-1', vapiCallId: 'v1', status: 'ended' },
    ]);
    const res = await GET(
      createRequest({ Authorization: 'Bearer test-pass' })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.calls).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('passes limit parameter to query', async () => {
    mockGetAllVoiceCalls.mockResolvedValue([]);
    await GET(
      createRequest({ Authorization: 'Bearer test-pass' }, '?limit=10')
    );
    expect(mockGetAllVoiceCalls).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 })
    );
  });

  it('passes date range parameters', async () => {
    mockGetAllVoiceCalls.mockResolvedValue([]);
    await GET(
      createRequest(
        { Authorization: 'Bearer test-pass' },
        '?startDate=2026-03-01&endDate=2026-03-08'
      )
    );
    expect(mockGetAllVoiceCalls).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-03-01',
        endDate: '2026-03-08',
      })
    );
  });
});
