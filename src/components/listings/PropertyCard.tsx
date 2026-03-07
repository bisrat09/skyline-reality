import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { PropertyBadge } from './PropertyBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';
import type { PropertyListing } from '@/types/listing';

// Stable Unsplash images for property cards (Seattle homes/architecture)
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop',
];

function getPropertyImage(listing: PropertyListing): string {
  // Use a hash of the address for stable image assignment
  let hash = 0;
  for (let i = 0; i < listing.address.length; i++) {
    hash = ((hash << 5) - hash + listing.address.charCodeAt(i)) | 0;
  }
  return PROPERTY_IMAGES[Math.abs(hash) % PROPERTY_IMAGES.length];
}

interface PropertyCardProps {
  listing: PropertyListing;
  className?: string;
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
  return (
    <Card hover className={cn('flex flex-col', className)}>
      {/* Property image */}
      <div className="relative h-56">
        <Image
          src={getPropertyImage(listing)}
          alt={`Property at ${listing.address}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <PropertyBadge type="status" value={listing.status} />
          <PropertyBadge type="propertyType" value={listing.propertyType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(listing.price)}
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-3">{listing.address}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>{listing.bedrooms} bd</span>
          <span className="text-gray-300">|</span>
          <span>{listing.bathrooms} ba</span>
          <span className="text-gray-300">|</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
        </div>

        {/* Neighborhood */}
        <p className="text-sm font-medium text-compass-500">{listing.neighborhood}</p>

        {/* Features */}
        {listing.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
