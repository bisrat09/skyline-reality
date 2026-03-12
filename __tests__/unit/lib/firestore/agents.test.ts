import { createAgent, getAgentById, updateAgent } from '@/lib/firestore/agents';

// Mock admin SDK
const mockAdd = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: (...args: unknown[]) => mockCollection(...args),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCollection.mockReturnValue({
    add: mockAdd,
    doc: mockDoc,
  });
  mockDoc.mockReturnValue({
    get: mockGet,
    update: mockUpdate,
  });
});

describe('createAgent', () => {
  it('creates an agent and returns the ID', async () => {
    mockAdd.mockResolvedValue({ id: 'agent-123' });

    const id = await createAgent({
      name: 'Sarah Chen',
      brokerage: 'Compass',
      phone: '2065551234',
      chatGreeting: 'Hello!',
      listings: [],
      calLink: 'https://cal.com/sarah/showing',
    });

    expect(id).toBe('agent-123');
    expect(mockCollection).toHaveBeenCalledWith('agents');
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Sarah Chen',
        brokerage: 'Compass',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    );
  });
});

describe('getAgentById', () => {
  it('returns agent when found', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      id: 'agent-123',
      data: () => ({
        name: 'Sarah Chen',
        brokerage: 'Compass',
        phone: '2065551234',
        chatGreeting: 'Hi!',
        listings: [],
        calLink: '',
      }),
    });

    const agent = await getAgentById('agent-123');
    expect(agent).toMatchObject({ id: 'agent-123', name: 'Sarah Chen' });
  });

  it('returns null when not found', async () => {
    mockGet.mockResolvedValue({ exists: false });

    const agent = await getAgentById('nonexistent');
    expect(agent).toBeNull();
  });
});

describe('updateAgent', () => {
  it('updates agent fields with updatedAt timestamp', async () => {
    mockUpdate.mockResolvedValue(undefined);

    await updateAgent('agent-123', { chatGreeting: 'Welcome!' });

    expect(mockDoc).toHaveBeenCalledWith('agent-123');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        chatGreeting: 'Welcome!',
        updatedAt: expect.any(String),
      })
    );
  });
});
