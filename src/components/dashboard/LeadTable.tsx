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
        <p className="text-gray-500">No leads found.</p>
        <p className="text-sm text-gray-400 mt-1">
          Leads will appear here once visitors interact with the chatbot.
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
