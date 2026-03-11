import { NextRequest, NextResponse } from 'next/server';
import type { PropertyListing, ListingStatus, PropertyType } from '@/types/listing';

function parsePositiveInt(value: string | null, max?: number): number | null {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 0) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

export async function GET(request: NextRequest) {
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ListingStatus | null;
    const neighborhood = searchParams.get('neighborhood');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const propertyType = searchParams.get('propertyType') as PropertyType | null;
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');

    // Validate numeric params
    const limit = parsePositiveInt(limitParam, 100);
    if (limitParam && limit === null) {
      return NextResponse.json({ error: 'Invalid limit (must be 1-100)' }, { status: 400 });
    }
    const minPriceNum = parsePositiveInt(minPrice);
    if (minPrice && minPriceNum === null) {
      return NextResponse.json({ error: 'Invalid minPrice' }, { status: 400 });
    }
    const maxPriceNum = parsePositiveInt(maxPrice);
    if (maxPrice && maxPriceNum === null) {
      return NextResponse.json({ error: 'Invalid maxPrice' }, { status: 400 });
    }
    const bedroomsNum = parsePositiveInt(bedrooms, 20);
    if (bedrooms && bedroomsNum === null) {
      return NextResponse.json({ error: 'Invalid bedrooms' }, { status: 400 });
    }

    let ref: FirebaseFirestore.Query = adminDb.collection('listings');

    if (status) ref = ref.where('status', '==', status);
    if (neighborhood) ref = ref.where('neighborhood', '==', neighborhood);
    if (propertyType) ref = ref.where('propertyType', '==', propertyType);
    if (featured === 'true') ref = ref.where('isFeatured', '==', true);
    if (limit) ref = ref.limit(limit);

    const snapshot = await ref.get();
    let listings = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as PropertyListing)
    );

    // Post-query range filters (Firestore doesn't support range on multiple fields)
    if (minPriceNum) listings = listings.filter((l) => l.price >= minPriceNum);
    if (maxPriceNum) listings = listings.filter((l) => l.price <= maxPriceNum);
    if (bedroomsNum) listings = listings.filter((l) => l.bedrooms >= bedroomsNum);

    return NextResponse.json(
      { listings, total: listings.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Listings API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
