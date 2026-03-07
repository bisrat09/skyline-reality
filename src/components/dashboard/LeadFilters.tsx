'use client';

import { Button } from '@/components/ui/Button';
import type { LeadsQueryParams } from '@/types/dashboard';

interface LeadFiltersProps {
  filters: LeadsQueryParams;
  onFilterChange: (filters: LeadsQueryParams) => void;
}

const selectStyles =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-compass-500 focus:outline-none focus:ring-1 focus:ring-compass-500';

export function LeadFilters({ filters, onFilterChange }: LeadFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by status"
        value={filters.status || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            status: (e.target.value || undefined) as LeadsQueryParams['status'],
          })
        }
        className={selectStyles}
      >
        <option value="">All Statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="showing_booked">Showing Booked</option>
        <option value="closed">Closed</option>
      </select>

      <select
        aria-label="Filter by urgency"
        value={filters.urgency || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            urgency: (e.target.value || undefined) as LeadsQueryParams['urgency'],
          })
        }
        className={selectStyles}
      >
        <option value="">All Urgencies</option>
        <option value="hot">Hot</option>
        <option value="warm">Warm</option>
        <option value="cold">Cold</option>
      </select>

      <input
        type="date"
        aria-label="Start date"
        value={filters.startDate || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            startDate: e.target.value || undefined,
          })
        }
        className={selectStyles}
      />

      <input
        type="date"
        aria-label="End date"
        value={filters.endDate || ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            endDate: e.target.value || undefined,
          })
        }
        className={selectStyles}
      />

      {(filters.status || filters.urgency || filters.startDate || filters.endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange({})}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
