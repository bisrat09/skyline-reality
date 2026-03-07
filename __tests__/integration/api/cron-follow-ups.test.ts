/**
 * @jest-environment node
 */

const mockGetPendingFollowUps = jest.fn();
const mockMarkFollowUpSent = jest.fn();
const mockMarkFollowUpFailed = jest.fn();
const mockSendEmail = jest.fn();
const mockLeadGet = jest.fn();

jest.mock('@/lib/firestore/followUps', () => ({
  getPendingFollowUps: (...args: unknown[]) => mockGetPendingFollowUps(...args),
  markFollowUpSent: (...args: unknown[]) => mockMarkFollowUpSent(...args),
  markFollowUpFailed: (...args: unknown[]) => mockMarkFollowUpFailed(...args),
}));

jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/email/templates/followUpDay1', () => ({
  buildFollowUpDay1Email: jest.fn().mockReturnValue({ subject: 'Day 1', html: '<p>Day 1</p>' }),
}));

jest.mock('@/lib/email/templates/followUpDay3', () => ({
  buildFollowUpDay3Email: jest.fn().mockReturnValue({ subject: 'Day 3', html: '<p>Day 3</p>' }),
}));

jest.mock('@/lib/email/templates/followUpDay7', () => ({
  buildFollowUpDay7Email: jest.fn().mockReturnValue({ subject: 'Day 7', html: '<p>Day 7</p>' }),
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockLeadGet,
      }),
    }),
  },
}));

import { GET } from '@/app/api/cron/follow-ups/route';
import { NextRequest } from 'next/server';

function createRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/cron/follow-ups', {
    method: 'GET',
    headers,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = 'test-secret';
  mockLeadGet.mockResolvedValue({
    exists: true,
    data: () => ({
      preferredNeighborhoods: ['Ballard'],
      budgetMin: 500000,
      budgetMax: 800000,
    }),
  });
});

afterEach(() => {
  delete process.env.CRON_SECRET;
});

describe('GET /api/cron/follow-ups', () => {
  it('returns 401 without auth header', async () => {
    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong secret', async () => {
    const res = await GET(createRequest({ authorization: 'Bearer wrong-secret' }));
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid auth and no pending follow-ups', async () => {
    mockGetPendingFollowUps.mockResolvedValue([]);
    const res = await GET(createRequest({ authorization: 'Bearer test-secret' }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.processed).toBe(0);
    expect(data.message).toContain('No pending');
  });

  it('processes and sends pending day1 follow-ups', async () => {
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-1', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day1' },
    ]);
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });

    const res = await GET(createRequest({ authorization: 'Bearer test-secret' }));
    const data = await res.json();
    expect(data.sent).toBe(1);
    expect(data.failed).toBe(0);
    expect(mockMarkFollowUpSent).toHaveBeenCalledWith('fu-1');
  });

  it('processes day3 and day7 follow-ups', async () => {
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-2', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day3' },
      { id: 'fu-3', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day7' },
    ]);
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });

    const res = await GET(createRequest({ authorization: 'Bearer test-secret' }));
    const data = await res.json();
    expect(data.sent).toBe(2);
    expect(data.processed).toBe(2);
  });

  it('marks failed follow-ups when email send fails', async () => {
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-1', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day1' },
    ]);
    mockSendEmail.mockResolvedValue({ success: false, error: 'Rate limited' });

    const res = await GET(createRequest({ authorization: 'Bearer test-secret' }));
    const data = await res.json();
    expect(data.failed).toBe(1);
    expect(mockMarkFollowUpFailed).toHaveBeenCalledWith('fu-1', 'Rate limited');
  });

  it('handles mixed success and failure', async () => {
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-1', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day1' },
      { id: 'fu-2', leadId: 'lead-2', leadEmail: 'b@c.com', leadName: 'Test2', type: 'day3' },
    ]);
    mockSendEmail
      .mockResolvedValueOnce({ success: true, messageId: 'msg-1' })
      .mockResolvedValueOnce({ success: false, error: 'Bounce' });

    const res = await GET(createRequest({ authorization: 'Bearer test-secret' }));
    const data = await res.json();
    expect(data.sent).toBe(1);
    expect(data.failed).toBe(1);
    expect(data.processed).toBe(2);
  });

  it('enriches follow-up data from lead document', async () => {
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-1', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day1' },
    ]);
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });

    await GET(createRequest({ authorization: 'Bearer test-secret' }));
    expect(mockLeadGet).toHaveBeenCalled();
  });

  it('sends with replyTo from AGENT_EMAIL', async () => {
    process.env.AGENT_EMAIL = 'agent@test.com';
    mockGetPendingFollowUps.mockResolvedValue([
      { id: 'fu-1', leadId: 'lead-1', leadEmail: 'a@b.com', leadName: 'Test', type: 'day1' },
    ]);
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' });

    await GET(createRequest({ authorization: 'Bearer test-secret' }));
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'agent@test.com' })
    );
    delete process.env.AGENT_EMAIL;
  });
});
