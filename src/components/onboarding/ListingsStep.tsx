'use client';

import { Button } from '@/components/ui/Button';
import { ListingFormCard } from './ListingFormCard';
import type { AgentListing } from '@/types/agent';
import type { FormData } from '@/hooks/useOnboarding';

interface ListingsStepProps {
  formData: FormData;
  errors: Record<string, string>;
  addListing: () => void;
  updateListing: (id: string, field: keyof AgentListing, value: string | number) => void;
  removeListing: (id: string) => void;
}

export function ListingsStep({
  formData,
  errors,
  addListing,
  updateListing,
  removeListing,
}: ListingsStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Add your property listings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your AI chatbot will use these to recommend properties to visitors.
        </p>
      </div>

      {errors.listings && (
        <p className="text-sm text-red-500">{errors.listings}</p>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {formData.listings.map((listing, idx) => (
          <ListingFormCard
            key={listing.id}
            listing={listing}
            index={idx}
            errors={errors}
            onUpdate={updateListing}
            onRemove={removeListing}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={addListing}
        className="w-full"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Listing
      </Button>
    </div>
  );
}
