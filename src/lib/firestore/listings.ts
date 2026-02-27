import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PropertyListing, ListingStatus, PropertyType } from '@/types/listing';

const COLLECTION = 'listings';

export async function getAllListings(): Promise<PropertyListing[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PropertyListing));
}

export async function getActiveListings(): Promise<PropertyListing[]> {
  const q = query(collection(db, COLLECTION), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PropertyListing));
}

export async function getFeaturedListings(): Promise<PropertyListing[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isFeatured', '==', true),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PropertyListing));
}

export async function getListingById(id: string): Promise<PropertyListing | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as PropertyListing;
}

export interface ListingFilters {
  status?: ListingStatus;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
  featured?: boolean;
  limit?: number;
}

export async function getFilteredListings(
  filters: ListingFilters
): Promise<PropertyListing[]> {
  let q = query(collection(db, COLLECTION));

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters.neighborhood) {
    q = query(q, where('neighborhood', '==', filters.neighborhood));
  }
  if (filters.propertyType) {
    q = query(q, where('propertyType', '==', filters.propertyType));
  }
  if (filters.featured !== undefined) {
    q = query(q, where('isFeatured', '==', filters.featured));
  }
  if (filters.limit) {
    q = query(q, firestoreLimit(filters.limit));
  }

  const snapshot = await getDocs(q);
  let listings = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as PropertyListing)
  );

  // Client-side filters for range queries (Firestore limitation)
  if (filters.minPrice) {
    listings = listings.filter((l) => l.price >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    listings = listings.filter((l) => l.price <= filters.maxPrice!);
  }
  if (filters.bedrooms) {
    listings = listings.filter((l) => l.bedrooms >= filters.bedrooms!);
  }

  return listings;
}
