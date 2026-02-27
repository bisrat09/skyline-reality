import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, limit as firestoreLimit } from 'firebase/firestore';
import type { PropertyListing, ListingStatus, PropertyType } from '@/types/listing';

// Lazy-import db to avoid initialization at module load during tests
async function getDb() {
  const { db } = await import('@/lib/firebase/client');
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ListingStatus | null;
    const neighborhood = searchParams.get('neighborhood');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const propertyType = searchParams.get('propertyType') as PropertyType | null;
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');

    const db = await getDb();
    let q = query(collection(db, 'listings'));

    if (status) q = query(q, where('status', '==', status));
    if (neighborhood) q = query(q, where('neighborhood', '==', neighborhood));
    if (propertyType) q = query(q, where('propertyType', '==', propertyType));
    if (featured === 'true') q = query(q, where('isFeatured', '==', true));
    if (limitParam) q = query(q, firestoreLimit(parseInt(limitParam, 10)));

    const snapshot = await getDocs(q);
    let listings = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as PropertyListing)
    );

    // Client-side range filters
    if (minPrice) listings = listings.filter((l) => l.price >= parseInt(minPrice, 10));
    if (maxPrice) listings = listings.filter((l) => l.price <= parseInt(maxPrice, 10));
    if (bedrooms) listings = listings.filter((l) => l.bedrooms >= parseInt(bedrooms, 10));

    return NextResponse.json(
      { listings, total: listings.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Listings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
