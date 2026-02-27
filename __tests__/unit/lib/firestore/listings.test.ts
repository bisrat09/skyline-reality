import {
  getDocs,
  getDoc,
  collection,
  doc,
  query,
  where,
} from 'firebase/firestore';
import {
  getAllListings,
  getActiveListings,
  getFeaturedListings,
  getListingById,
  getFilteredListings,
} from '@/lib/firestore/listings';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/client', () => ({ db: {} }));

const mockListing = {
  address: '123 Test St',
  neighborhood: 'Ballard',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  propertyType: 'single_family',
  status: 'active',
  isFeatured: true,
};

const mockDoc = { id: 'test-id', data: () => mockListing, exists: () => true };
const mockSnapshot = { docs: [mockDoc], empty: false, size: 1 };

beforeEach(() => {
  jest.clearAllMocks();
  (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
  (getDoc as jest.Mock).mockResolvedValue(mockDoc);
});

describe('getAllListings', () => {
  it('returns all listings', async () => {
    const result = await getAllListings();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id');
    expect(collection).toHaveBeenCalled();
  });
});

describe('getActiveListings', () => {
  it('filters by active status', async () => {
    await getActiveListings();
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
  });
});

describe('getFeaturedListings', () => {
  it('filters by isFeatured', async () => {
    await getFeaturedListings();
    expect(where).toHaveBeenCalledWith('isFeatured', '==', true);
  });
});

describe('getListingById', () => {
  it('returns single listing', async () => {
    const result = await getListingById('test-id');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('test-id');
  });

  it('returns null for nonexistent', async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    const result = await getListingById('fake-id');
    expect(result).toBeNull();
  });
});

describe('getFilteredListings', () => {
  it('applies price range filter', async () => {
    const result = await getFilteredListings({ minPrice: 400000, maxPrice: 600000 });
    expect(result).toHaveLength(1);
  });

  it('applies neighborhood filter', async () => {
    await getFilteredListings({ neighborhood: 'Ballard' });
    expect(where).toHaveBeenCalledWith('neighborhood', '==', 'Ballard');
  });

  it('applies multiple filters', async () => {
    await getFilteredListings({ neighborhood: 'Ballard', status: 'active', bedrooms: 2 });
    expect(where).toHaveBeenCalledWith('neighborhood', '==', 'Ballard');
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
  });
});
