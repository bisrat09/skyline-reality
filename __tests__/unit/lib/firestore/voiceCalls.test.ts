/**
 * @jest-environment node
 */

const mockAdd = jest.fn().mockResolvedValue({ id: 'vc-1' });
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockWhere = jest.fn().mockReturnThis();
const mockOrderBy = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockDoc = jest.fn().mockImplementation((id?: string) => ({
  id: id || 'vc-1',
  update: mockUpdate,
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      add: mockAdd,
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
    }),
  },
}));

import {
  createVoiceCall,
  updateVoiceCall,
  getVoiceCallByVapiId,
  getAllVoiceCalls,
  linkCallToLead,
} from '@/lib/firestore/voiceCalls';

beforeEach(() => {
  jest.clearAllMocks();
  // Reset chain methods to return `this`-like object
  mockWhere.mockReturnThis();
  mockOrderBy.mockReturnValue({
    limit: mockLimit,
    get: mockGet,
  });
  mockLimit.mockReturnValue({ get: mockGet });
});

describe('createVoiceCall', () => {
  it('returns document ID', async () => {
    const id = await createVoiceCall({
      vapiCallId: 'vapi-1',
      phoneNumber: '2065551234',
      status: 'in-progress',
    });
    expect(id).toBe('vc-1');
  });

  it('sets timestamps', async () => {
    await createVoiceCall({
      vapiCallId: 'vapi-1',
      phoneNumber: null,
      status: 'in-progress',
    });
    const addedDoc = mockAdd.mock.calls[0][0];
    expect(addedDoc.createdAt).toBeDefined();
    expect(addedDoc.updatedAt).toBeDefined();
  });

  it('sets default null fields', async () => {
    await createVoiceCall({
      vapiCallId: 'vapi-1',
      phoneNumber: null,
      status: 'queued',
    });
    const addedDoc = mockAdd.mock.calls[0][0];
    expect(addedDoc.leadId).toBeNull();
    expect(addedDoc.duration).toBeNull();
    expect(addedDoc.transcript).toBe('');
    expect(addedDoc.summary).toBeNull();
    expect(addedDoc.recordingUrl).toBeNull();
    expect(addedDoc.endedAt).toBeNull();
  });
});

describe('updateVoiceCall', () => {
  it('merges update fields', async () => {
    await updateVoiceCall('vc-1', { status: 'ended', duration: 300 });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ended', duration: 300 })
    );
  });

  it('always sets updatedAt', async () => {
    await updateVoiceCall('vc-1', { transcript: 'Hello' });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: expect.any(String) })
    );
  });
});

describe('getVoiceCallByVapiId', () => {
  it('returns call when found', async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        { id: 'vc-1', data: () => ({ vapiCallId: 'vapi-1', status: 'ended' }) },
      ],
    });
    const result = await getVoiceCallByVapiId('vapi-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('vc-1');
    expect(result!.vapiCallId).toBe('vapi-1');
  });

  it('returns null when not found', async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    const result = await getVoiceCallByVapiId('nonexistent');
    expect(result).toBeNull();
  });

  it('queries with vapiCallId filter', async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });
    await getVoiceCallByVapiId('vapi-abc');
    expect(mockWhere).toHaveBeenCalledWith('vapiCallId', '==', 'vapi-abc');
  });
});

describe('getAllVoiceCalls', () => {
  it('returns all calls sorted by createdAt desc', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'vc-1', data: () => ({ vapiCallId: 'v1', createdAt: '2026-03-08' }) },
        { id: 'vc-2', data: () => ({ vapiCallId: 'v2', createdAt: '2026-03-07' }) },
      ],
    });
    const results = await getAllVoiceCalls();
    expect(results).toHaveLength(2);
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('applies limit parameter', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    await getAllVoiceCalls({ limit: 10 });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('filters by startDate', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'vc-1', data: () => ({ createdAt: '2026-03-08' }) },
        { id: 'vc-2', data: () => ({ createdAt: '2026-03-01' }) },
      ],
    });
    const results = await getAllVoiceCalls({ startDate: '2026-03-05' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('vc-1');
  });

  it('filters by endDate', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'vc-1', data: () => ({ createdAt: '2026-03-08' }) },
        { id: 'vc-2', data: () => ({ createdAt: '2026-03-01' }) },
      ],
    });
    const results = await getAllVoiceCalls({ endDate: '2026-03-05' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('vc-2');
  });
});

describe('linkCallToLead', () => {
  it('updates leadId field', async () => {
    await linkCallToLead('vc-1', 'lead-abc');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: 'lead-abc' })
    );
  });

  it('sets updatedAt timestamp', async () => {
    await linkCallToLead('vc-1', 'lead-abc');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ updatedAt: expect.any(String) })
    );
  });
});
