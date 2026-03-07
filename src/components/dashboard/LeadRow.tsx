'use client';

import { Badge } from '@/components/ui/Badge';
import { StatusSelect } from './StatusSelect';
import { TranscriptView } from './TranscriptView';
import { formatDate } from '@/lib/utils/formatDate';
import type { DashboardLead } from '@/types/dashboard';
import type { LeadStatus, LeadUrgency } from '@/types/lead';

interface LeadRowProps {
  lead: DashboardLead;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: LeadStatus) => void;
  isUpdating: boolean;
}

const urgencyVariant: Record<LeadUrgency, 'danger' | 'warning' | 'default'> = {
  hot: 'danger',
  warm: 'warning',
  cold: 'default',
};

const statusVariant: Record<LeadStatus, 'default' | 'warning' | 'success'> = {
  new: 'default',
  contacted: 'default',
  showing_booked: 'warning',
  closed: 'success',
};

const statusLabel: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  showing_booked: 'Showing Booked',
  closed: 'Closed',
};

export function LeadRow({
  lead,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  isUpdating,
}: LeadRowProps) {
  return (
    <>
      {/* Desktop row */}
      <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3">
          <p className="font-medium text-gray-900">
            {lead.name || 'Anonymous'}
          </p>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-600">{lead.email || '—'}</p>
          <p className="text-sm text-gray-400">{lead.phone || ''}</p>
        </td>
        <td className="px-4 py-3">
          <Badge variant={urgencyVariant[lead.urgency]}>
            {lead.urgency.toUpperCase()}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <Badge variant={statusVariant[lead.status]}>
            {statusLabel[lead.status]}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <StatusSelect
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            isUpdating={isUpdating}
          />
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {formatDate(lead.createdAt)}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggleExpand}
            className="text-sm text-compass-500 hover:text-compass-600 font-medium"
            aria-label={isExpanded ? 'Collapse transcript' : 'Expand transcript'}
          >
            {isExpanded ? 'Hide' : 'View'}
          </button>
        </td>
      </tr>

      {/* Desktop transcript row */}
      {isExpanded && (
        <tr className="hidden md:table-row border-b border-gray-200 bg-gray-50">
          <td colSpan={7} className="px-4 py-2">
            <TranscriptView transcript={lead.conversationTranscript} />
          </td>
        </tr>
      )}

      {/* Mobile card */}
      <tr className="md:hidden">
        <td colSpan={7} className="p-0">
          <div className="border-b border-gray-100 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">
                {lead.name || 'Anonymous'}
              </p>
              <div className="flex gap-2">
                <Badge variant={urgencyVariant[lead.urgency]}>
                  {lead.urgency.toUpperCase()}
                </Badge>
                <Badge variant={statusVariant[lead.status]}>
                  {statusLabel[lead.status]}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {lead.email || '—'} {lead.phone ? `| ${lead.phone}` : ''}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusSelect
                  currentStatus={lead.status}
                  onStatusChange={onStatusChange}
                  isUpdating={isUpdating}
                />
                <span className="text-xs text-gray-400">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
              <button
                onClick={onToggleExpand}
                className="text-sm text-compass-500 hover:text-compass-600 font-medium"
              >
                {isExpanded ? 'Hide' : 'View'} Transcript
              </button>
            </div>
            {isExpanded && (
              <TranscriptView transcript={lead.conversationTranscript} />
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
