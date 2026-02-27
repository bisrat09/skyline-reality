const mockDocRef = {
  get: jest.fn().mockResolvedValue({
    exists: true,
    data: jest.fn().mockReturnValue({}),
    id: 'mock-id',
  }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
};

const mockQuerySnapshot = {
  docs: [],
  empty: true,
  size: 0,
  forEach: jest.fn(),
};

const mockCollectionRef = {
  doc: jest.fn().mockReturnValue(mockDocRef),
  add: jest.fn().mockResolvedValue({ id: 'new-mock-id' }),
  get: jest.fn().mockResolvedValue(mockQuerySnapshot),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

const mockFirestore = jest.fn().mockReturnValue({
  collection: jest.fn().mockReturnValue(mockCollectionRef),
  batch: jest.fn().mockReturnValue({
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  }),
});

const admin = {
  initializeApp: jest.fn().mockReturnValue({}),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  firestore: mockFirestore,
  apps: [] as unknown[],
};

export default admin;
export { admin };
