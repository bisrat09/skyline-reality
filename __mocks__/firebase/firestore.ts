const mockDoc = {
  id: 'mock-id',
  data: jest.fn().mockReturnValue({}),
  exists: jest.fn().mockReturnValue(true),
};

const mockQuerySnapshot = {
  docs: [mockDoc],
  empty: false,
  size: 1,
  forEach: jest.fn((cb) => cb(mockDoc)),
};

export const getFirestore = jest.fn().mockReturnValue({});
export const collection = jest.fn().mockReturnValue({});
export const doc = jest.fn().mockReturnValue({});
export const getDocs = jest.fn().mockResolvedValue(mockQuerySnapshot);
export const getDoc = jest.fn().mockResolvedValue(mockDoc);
export const addDoc = jest.fn().mockResolvedValue({ id: 'new-mock-id' });
export const updateDoc = jest.fn().mockResolvedValue(undefined);
export const setDoc = jest.fn().mockResolvedValue(undefined);
export const query = jest.fn().mockReturnValue({});
export const where = jest.fn().mockReturnValue({});
export const orderBy = jest.fn().mockReturnValue({});
export const limit = jest.fn().mockReturnValue({});
export const writeBatch = jest.fn().mockReturnValue({
  set: jest.fn(),
  commit: jest.fn().mockResolvedValue(undefined),
});
