/**
 * @jest-environment node
 */
import { POST } from '@/app/api/leads/route';
import { NextRequest } from 'next/server';

const mockAdd = jest.fn().mockResolvedValue({ id: 'new-lead-id' });
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockWhere = jest.fn().mockReturnThis();
const mockGet = jest.fn().mockResolvedValue({ empty: true, docs: [] });

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      add: mockAdd,
      where: mockWhere,
      get: mockGet,
    }),
  },
}));

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ empty: true, docs: [] });
});

describe('POST /api/leads', () => {
  it('creates lead in Firestore', async () => {
    const res = await POST(
      createRequest({ sessionId: 's1', email: 'a@b.com', conversationTranscript: [] })
    );
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.leadId).toBe('new-lead-id');
  });

  it('returns 400 without email or phone', async () => {
    const res = await POST(
      createRequest({ sessionId: 's1', name: 'Test', conversationTranscript: [] })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('contact method');
  });

  it('returns 400 without sessionId', async () => {
    const res = await POST(
      createRequest({ email: 'a@b.com', conversationTranscript: [] })
    );
    expect(res.status).toBe(400);
  });

  it('calculates hot urgency correctly', async () => {
    await POST(
      createRequest({
        sessionId: 's1',
        email: 'a@b.com',
        phone: '2065551234',
        name: 'Test',
        budgetMin: 500000,
        timeline: 'ASAP',
        preferredNeighborhoods: ['Ballard'],
        conversationTranscript: [],
      })
    );
    const arg = mockAdd.mock.calls[0][0];
    expect(arg.urgency).toBe('hot');
  });

  it('calculates warm urgency correctly', async () => {
    await POST(
      createRequest({
        sessionId: 's1',
        email: 'a@b.com',
        budgetMin: 500000,
        conversationTranscript: [],
      })
    );
    const arg = mockAdd.mock.calls[0][0];
    expect(arg.urgency).toBe('warm');
  });

  it('calculates cold urgency correctly', async () => {
    await POST(
      createRequest({
        sessionId: 's1',
        phone: '2065551234',
        conversationTranscript: [],
      })
    );
    const arg = mockAdd.mock.calls[0][0];
    expect(arg.urgency).toBe('cold');
  });

  it('stores conversation transcript', async () => {
    const transcript = [{ role: 'user', content: 'Hello' }];
    await POST(
      createRequest({ sessionId: 's1', email: 'a@b.com', conversationTranscript: transcript })
    );
    const arg = mockAdd.mock.calls[0][0];
    expect(arg.conversationTranscript).toEqual(transcript);
  });

  it('sets status to new', async () => {
    await POST(
      createRequest({ sessionId: 's1', email: 'a@b.com', conversationTranscript: [] })
    );
    const arg = mockAdd.mock.calls[0][0];
    expect(arg.status).toBe('new');
  });

  it('updates existing lead for same session', async () => {
    const mockDocRef = { ref: { update: mockUpdate } };
    mockGet.mockResolvedValue({ empty: false, docs: [{ id: 'existing-id', ...mockDocRef }] });

    const res = await POST(
      createRequest({ sessionId: 's1', email: 'a@b.com', conversationTranscript: [] })
    );
    const data = await res.json();
    expect(data.leadId).toBe('existing-id');
    expect(mockUpdate).toHaveBeenCalled();
  });
});
