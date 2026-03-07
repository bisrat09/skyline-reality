'use client';

import { Spinner } from '@/components/ui/Spinner';
import type { LeadStatus } from '@/types/lead';

interface StatusSelectProps {
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
  isUpdating?: boolean;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'showing_booked', label: 'Showing Booked' },
  { value: 'closed', label: 'Closed' },
];

export function StatusSelect({
  currentStatus,
  onStatusChange,
  isUpdating = false,
}: StatusSelectProps) {
  if (isUpdating) {
    return <Spinner size="sm" />;
  }

  return (
    <select
      aria-label="Change status"
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
      className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-compass-500 focus:outline-none focus:ring-1 focus:ring-compass-500"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
