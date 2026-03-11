import { NextRequest, NextResponse } from 'next/server';
import type { PropertyListing, ListingStatus, PropertyType } from '@/types/listing';

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

    let ref: FirebaseFirestore.Query = adminDb.collection('listings');

    if (status) ref = ref.where('status', '==', status);
    if (neighborhood) ref = ref.where('neighborhood', '==', neighborhood);
    if (propertyType) ref = ref.where('propertyType', '==', propertyType);
    if (featured === 'true') ref = ref.where('isFeatured', '==', true);
    if (limitParam) ref = ref.limit(parseInt(limitParam, 10));

    const snapshot = await ref.get();
    let listings = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as PropertyListing)
    );

    // Post-query range filters (Firestore doesn't support range on multiple fields)
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
