'use client';

import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { AgentListing } from '@/types/agent';

interface ListingFormCardProps {
  listing: AgentListing;
  index: number;
  errors: Record<string, string>;
  onUpdate: (id: string, field: keyof AgentListing, value: string | number) => void;
  onRemove: (id: string) => void;
}

export function ListingFormCard({
  listing,
  index,
  errors,
  onUpdate,
  onRemove,
}: ListingFormCardProps) {
  return (
    <Card className="p-4 relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">Listing {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(listing.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove listing"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <Input
          label="Property Name"
          placeholder="e.g. Modern 3BD Condo in Capitol Hill"
          value={listing.name}
          onChange={(e) => onUpdate(listing.id, 'name', e.target.value)}
          error={errors[`listing_${listing.id}_name`]}
        />

        <Input
          label="Address"
          placeholder="e.g. 1234 Pine St, Seattle, WA 98101"
          value={listing.address}
          onChange={(e) => onUpdate(listing.id, 'address', e.target.value)}
          error={errors[`listing_${listing.id}_address`]}
        />

        <Input
          label="Price ($)"
          type="number"
          placeholder="e.g. 750000"
          value={listing.price || ''}
          onChange={(e) => onUpdate(listing.id, 'price', Number(e.target.value))}
          error={errors[`listing_${listing.id}_price`]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Bedrooms"
            type="number"
            placeholder="3"
            min={0}
            value={listing.bedrooms || ''}
            onChange={(e) => onUpdate(listing.id, 'bedrooms', Number(e.target.value))}
          />
          <Input
            label="Bathrooms"
            type="number"
            placeholder="2"
            min={0}
            step={0.5}
            value={listing.bathrooms || ''}
            onChange={(e) => onUpdate(listing.id, 'bathrooms', Number(e.target.value))}
          />
        </div>
      </div>
    </Card>
  );
}
