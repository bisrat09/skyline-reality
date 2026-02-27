/**
 * @jest-environment node
 */
import { GET } from '@/app/api/listings/route';
import { NextRequest } from 'next/server';
import { getDocs } from 'firebase/firestore';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/client', () => ({ db: {} }));

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
  (getDocs as jest.Mock).mockResolvedValue({
    docs: [mockDoc],
    empty: false,
    size: 1,
  });
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
    const { where } = require('firebase/firestore');
    await GET(createRequest({ status: 'active' }));
    expect(where).toHaveBeenCalledWith('status', '==', 'active');
  });

  it('filters by neighborhood', async () => {
    const { where } = require('firebase/firestore');
    await GET(createRequest({ neighborhood: 'Ballard' }));
    expect(where).toHaveBeenCalledWith('neighborhood', '==', 'Ballard');
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
    const { where } = require('firebase/firestore');
    await GET(createRequest({ propertyType: 'condo' }));
    expect(where).toHaveBeenCalledWith('propertyType', '==', 'condo');
  });

  it('filters by featured', async () => {
    const { where } = require('firebase/firestore');
    await GET(createRequest({ featured: 'true' }));
    expect(where).toHaveBeenCalledWith('isFeatured', '==', true);
  });

  it('returns empty array for no matches', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true, size: 0 });
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
