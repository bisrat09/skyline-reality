import { PropertyCard } from './PropertyCard';
import { cn } from '@/lib/utils/cn';
import type { PropertyListing } from '@/types/listing';

interface PropertyGridProps {
  listings: PropertyListing[];
  columns?: 2 | 3;
  className?: string;
}

export function PropertyGrid({ listings, columns = 3, className }: PropertyGridProps) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2',
        className
      )}
    >
      {listings.map((listing) => (
        <PropertyCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
