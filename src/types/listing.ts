export type PropertyType = 'single_family' | 'condo' | 'townhouse';
export type ListingStatus = 'active' | 'pending' | 'sold';

export interface PropertyListing {
  id: string;
  address: string;
  neighborhood: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: PropertyType;
  status: ListingStatus;
  yearBuilt: number;
  description: string;
  features: string[];
  neighborhoodHighlights: string[];
  imageUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
