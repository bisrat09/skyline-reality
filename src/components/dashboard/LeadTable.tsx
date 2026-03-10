'use client';

import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { LeadRow } from './LeadRow';
import type { DashboardLead } from '@/types/dashboard';
import type { LeadStatus } from '@/types/lead';

interface LeadTableProps {
  leads: DashboardLead[];
  isLoading: boolean;
  expandedLeadId: string | null;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  updatingLeadId: string | null;
}

export function LeadTable({
  leads,
  isLoading,
  expandedLeadId,
  onToggleExpand,
  onStatusChange,
  updatingLeadId,
}: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-compass-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-compass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium">No leads captured yet</p>
        <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
          When visitors interact with the AI chatbot and share their contact info, their leads will appear here automatically.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="hidden md:table-row bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Urgency
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Update
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transcript
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isExpanded={expandedLeadId === lead.id}
              onToggleExpand={() =>
                onToggleExpand(expandedLeadId === lead.id ? '' : lead.id)
              }
              onStatusChange={(status) => onStatusChange(lead.id, status)}
              isUpdating={updatingLeadId === lead.id}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
