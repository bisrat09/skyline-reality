import { cn } from '@/lib/utils/cn';
import type { ListingStatus, PropertyType } from '@/types/listing';

interface PropertyBadgeProps {
  type: 'status' | 'propertyType';
  value: ListingStatus | PropertyType;
  className?: string;
}

const statusStyles: Record<ListingStatus, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-gold-100 text-gold-700',
  sold: 'bg-red-100 text-red-700',
};

const statusLabels: Record<ListingStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  sold: 'Sold',
};

const propertyTypeLabels: Record<PropertyType, string> = {
  single_family: 'Single Family',
  condo: 'Condo',
  townhouse: 'Townhouse',
};

export function PropertyBadge({ type, value, className }: PropertyBadgeProps) {
  if (type === 'status') {
    const status = value as ListingStatus;
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          statusStyles[status],
          className
        )}
      >
        {statusLabels[status]}
      </span>
    );
  }

  const propertyType = value as PropertyType;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-navy-100 text-navy-700',
        className
      )}
    >
      {propertyTypeLabels[propertyType]}
    </span>
  );
}
