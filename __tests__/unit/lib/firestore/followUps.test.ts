/**
 * @jest-environment node
 */

const mockSet = jest.fn();
const mockCommit = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockLimit = jest.fn().mockReturnThis();
const mockWhere = jest.fn().mockImplementation(() => ({
  where: mockWhere,
  limit: mockLimit,
  get: mockGet,
}));
let docIdCounter = 0;
const mockDoc = jest.fn().mockImplementation((id?: string) => ({
  id: id || `doc-${docIdCounter++}`,
  update: mockUpdate,
  get: mockGet,
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      get: mockGet,
    }),
    batch: jest.fn().mockReturnValue({
      set: mockSet,
      update: jest.fn(),
      commit: mockCommit,
    }),
  },
}));

import {
  calculateScheduledDate,
  scheduleFollowUps,
  getPendingFollowUps,
  markFollowUpSent,
  markFollowUpFailed,
} from '@/lib/firestore/followUps';

beforeEach(() => {
  jest.clearAllMocks();
  docIdCounter = 0;
});

describe('calculateScheduledDate', () => {
  it('schedules day1 one day later at 10am', () => {
    const result = calculateScheduledDate('2026-03-07T14:00:00.000Z', 'day1');
    const date = new Date(result);
    expect(date.getDate()).toBe(8);
    expect(date.getHours()).toBe(10);
    expect(date.getMinutes()).toBe(0);
  });

  it('schedules day3 three days later', () => {
    const result = calculateScheduledDate('2026-03-07T14:00:00.000Z', 'day3');
    const date = new Date(result);
    expect(date.getDate()).toBe(10);
  });

  it('schedules day7 seven days later', () => {
    const result = calculateScheduledDate('2026-03-07T14:00:00.000Z', 'day7');
    const date = new Date(result);
    expect(date.getDate()).toBe(14);
  });

  it('returns valid ISO string', () => {
    const result = calculateScheduledDate('2026-03-07T14:00:00.000Z', 'day1');
    expect(() => new Date(result)).not.toThrow();
    expect(result).toContain('T');
  });
});

describe('scheduleFollowUps', () => {
  it('creates 3 follow-up documents', async () => {
    const ids = await scheduleFollowUps({
      leadId: 'lead-1',
      leadEmail: 'a@b.com',
      leadName: 'Test',
      createdAt: '2026-03-07T14:00:00.000Z',
    });
    expect(ids).toHaveLength(3);
    expect(mockSet).toHaveBeenCalledTimes(3);
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  it('sets correct types for each follow-up', async () => {
    await scheduleFollowUps({
      leadId: 'lead-1',
      leadEmail: 'a@b.com',
      leadName: 'Test',
      createdAt: '2026-03-07T14:00:00.000Z',
    });
    const types = mockSet.mock.calls.map(
      (call: unknown[]) => (call[1] as { type: string }).type
    );
    expect(types).toEqual(['day1', 'day3', 'day7']);
  });

  it('sets status to pending', async () => {
    await scheduleFollowUps({
      leadId: 'lead-1',
      leadEmail: 'a@b.com',
      leadName: 'Test',
      createdAt: '2026-03-07T14:00:00.000Z',
    });
    const statuses = mockSet.mock.calls.map(
      (call: unknown[]) => (call[1] as { status: string }).status
    );
    expect(statuses).toEqual(['pending', 'pending', 'pending']);
  });

  it('stores lead email and name', async () => {
    await scheduleFollowUps({
      leadId: 'lead-1',
      leadEmail: 'a@b.com',
      leadName: 'John',
      createdAt: '2026-03-07T14:00:00.000Z',
    });
    const firstCall = mockSet.mock.calls[0][1] as { leadEmail: string; leadName: string };
    expect(firstCall.leadEmail).toBe('a@b.com');
    expect(firstCall.leadName).toBe('John');
  });
});

describe('getPendingFollowUps', () => {
  it('queries for pending follow-ups due now', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'fu-1', data: () => ({ type: 'day1', status: 'pending', leadEmail: 'a@b.com' }) },
      ],
    });
    const results = await getPendingFollowUps();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('fu-1');
    expect(mockWhere).toHaveBeenCalledWith('status', '==', 'pending');
  });

  it('returns empty array when no pending follow-ups', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    const results = await getPendingFollowUps();
    expect(results).toEqual([]);
  });
});

describe('markFollowUpSent', () => {
  it('updates status to sent', async () => {
    await markFollowUpSent('fu-1');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'sent' })
    );
  });

  it('sets sentAt timestamp', async () => {
    await markFollowUpSent('fu-1');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ sentAt: expect.any(String) })
    );
  });
});

describe('markFollowUpFailed', () => {
  it('updates status to failed with reason', async () => {
    await markFollowUpFailed('fu-1', 'API error');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        failureReason: 'API error',
      })
    );
  });

  it('sets failedAt timestamp', async () => {
    await markFollowUpFailed('fu-1', 'error');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ failedAt: expect.any(String) })
    );
  });
});
