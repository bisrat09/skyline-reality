import { getDocs } from 'firebase/firestore';
import { getLeadBySessionId } from '@/lib/firestore/leads';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/client', () => ({ db: {} }));

beforeEach(() => {
  jest.clearAllMocks();
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
