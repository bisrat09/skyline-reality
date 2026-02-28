import { Card } from '@/components/ui/Card';
import { PropertyBadge } from './PropertyBadge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';
import type { PropertyListing } from '@/types/listing';

interface PropertyCardProps {
  listing: PropertyListing;
  className?: string;
}

export function PropertyCard({ listing, className }: PropertyCardProps) {
  return (
    <Card hover className={cn('flex flex-col', className)}>
      {/* Image placeholder with gradient */}
      <div className="relative h-48 bg-gradient-to-br from-navy-100 to-navy-200">
        <div className="absolute inset-0 flex items-center justify-center text-navy-300">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <div className="absolute top-3 left-3 flex gap-2">
          <PropertyBadge type="status" value={listing.status} />
          <PropertyBadge type="propertyType" value={listing.propertyType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <p className="text-2xl font-bold text-navy-800">
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
        <p className="text-sm font-medium text-gold-500">{listing.neighborhood}</p>

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
