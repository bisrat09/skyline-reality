/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const mockWhere = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockGet = jest.fn();

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      get: mockGet,
    }),
  },
}));

// Must import after mocks
import { GET } from '@/app/api/listings/route';

const mockListing = {
  address: '123 Test St',
  neighborhood: 'Ballard',
  price: 600000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  propertyType: 'single_family',
  status: 'active',
  isFeatured: true,
};

const mockDoc = { id: 'listing-1', data: () => mockListing };

function createRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/listings');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockWhere.mockReturnThis();
  mockLimit.mockReturnThis();
  mockGet.mockResolvedValue({ docs: [mockDoc] });
  // Make the chain work: collection().where().where().get()
  mockWhere.mockReturnValue({ where: mockWhere, limit: mockLimit, get: mockGet });
  mockLimit.mockReturnValue({ get: mockGet });
});

describe('GET /api/listings', () => {
  it('returns all listings', async () => {
    const res = await GET(createRequest());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.listings).toHaveLength(1);
    expect(data.total).toBe(1);
  });

  it('filters by status', async () => {
    await GET(createRequest({ status: 'active' }));
    expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active');
  });

  it('filters by neighborhood', async () => {
    await GET(createRequest({ neighborhood: 'Ballard' }));
    expect(mockWhere).toHaveBeenCalledWith('neighborhood', '==', 'Ballard');
  });

  it('filters by price range', async () => {
    const res = await GET(createRequest({ minPrice: '500000', maxPrice: '700000' }));
    const data = await res.json();
    expect(data.listings).toHaveLength(1);
  });

  it('filters out by price range', async () => {
    const res = await GET(createRequest({ minPrice: '700000' }));
    const data = await res.json();
    expect(data.listings).toHaveLength(0);
  });

  it('filters by bedrooms', async () => {
    const res = await GET(createRequest({ bedrooms: '3' }));
    const data = await res.json();
    expect(data.listings).toHaveLength(1);
  });

  it('filters by property type', async () => {
    await GET(createRequest({ propertyType: 'condo' }));
    expect(mockWhere).toHaveBeenCalledWith('propertyType', '==', 'condo');
  });

  it('filters by featured', async () => {
    await GET(createRequest({ featured: 'true' }));
    expect(mockWhere).toHaveBeenCalledWith('isFeatured', '==', true);
  });

  it('returns empty array for no matches', async () => {
    mockGet.mockResolvedValue({ docs: [] });
    const res = await GET(createRequest());
    const data = await res.json();
    expect(data.listings).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it('includes total count', async () => {
    const res = await GET(createRequest());
    const data = await res.json();
    expect(data).toHaveProperty('total');
  });

  it('sets cache headers', async () => {
    const res = await GET(createRequest());
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=60');
  });
});
