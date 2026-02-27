import { addDoc, updateDoc, getDocs } from 'firebase/firestore';
import {
  createLead,
  updateLead,
  getLeadBySessionId,
  createOrUpdateLead,
  calculateUrgency,
} from '@/lib/firestore/leads';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/client', () => ({ db: {} }));

const baseLead = {
  sessionId: 'session-1',
  conversationTranscript: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  (addDoc as jest.Mock).mockResolvedValue({ id: 'new-lead-id' });
  (updateDoc as jest.Mock).mockResolvedValue(undefined);
});

describe('calculateUrgency', () => {
  it('returns hot for complete lead with urgent timeline', () => {
    expect(
      calculateUrgency({
        ...baseLead,
        email: 'a@b.com',
        phone: '2065551234',
        name: 'Test',
        budgetMin: 500000,
        timeline: 'ASAP',
        preferredNeighborhoods: ['Ballard'],
      })
    ).toBe('hot');
  });

  it('returns warm for partial lead', () => {
    expect(
      calculateUrgency({
        ...baseLead,
        email: 'a@b.com',
        budgetMin: 500000,
      })
    ).toBe('warm');
  });

  it('returns cold for minimal lead', () => {
    expect(calculateUrgency({ ...baseLead, name: 'Test' })).toBe('cold');
  });
});

describe('createLead', () => {
  it('writes to leads collection', async () => {
    const id = await createLead({ ...baseLead, email: 'a@b.com' });
    expect(id).toBe('new-lead-id');
    expect(addDoc).toHaveBeenCalled();
  });

  it('sets timestamps', async () => {
    await createLead({ ...baseLead, email: 'a@b.com' });
    const arg = (addDoc as jest.Mock).mock.calls[0][1];
    expect(arg.createdAt).toBeDefined();
    expect(arg.updatedAt).toBeDefined();
  });

  it('calculates urgency', async () => {
    await createLead({ ...baseLead, email: 'a@b.com', phone: '2065551234', timeline: 'ASAP', budgetMin: 500000, name: 'X', preferredNeighborhoods: ['B'] });
    const arg = (addDoc as jest.Mock).mock.calls[0][1];
    expect(arg.urgency).toBe('hot');
  });

  it('sets status to new', async () => {
    await createLead({ ...baseLead, email: 'a@b.com' });
    const arg = (addDoc as jest.Mock).mock.calls[0][1];
    expect(arg.status).toBe('new');
  });
});

describe('updateLead', () => {
  it('updates existing document', async () => {
    await updateLead('lead-1', { name: 'Updated' } as never);
    expect(updateDoc).toHaveBeenCalled();
  });

  it('updates the updatedAt timestamp', async () => {
    await updateLead('lead-1', { name: 'Updated' } as never);
    const arg = (updateDoc as jest.Mock).mock.calls[0][1];
    expect(arg.updatedAt).toBeDefined();
  });
});

describe('getLeadBySessionId', () => {
  it('finds lead by session', async () => {
    const mockDoc = { id: 'lead-1', data: () => ({ sessionId: 'session-1' }) };
    (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [mockDoc] });
    const result = await getLeadBySessionId('session-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('lead-1');
  });

  it('returns null when not found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
    const result = await getLeadBySessionId('nonexistent');
    expect(result).toBeNull();
  });
});

describe('createOrUpdateLead', () => {
  it('creates new if not found', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });
    const id = await createOrUpdateLead({ ...baseLead, email: 'a@b.com' });
    expect(id).toBe('new-lead-id');
    expect(addDoc).toHaveBeenCalled();
  });

  it('updates if found', async () => {
    const mockDoc = { id: 'existing-id', data: () => ({ sessionId: 'session-1' }) };
    (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [mockDoc] });
    const id = await createOrUpdateLead({ ...baseLead, email: 'a@b.com' });
    expect(id).toBe('existing-id');
    expect(updateDoc).toHaveBeenCalled();
  });
});
