'use client';

import { useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { VoiceCallRow } from './VoiceCallRow';
import type { VoiceCall } from '@/types/voice';

interface VoiceCallTableProps {
  calls: Array<VoiceCall & { id: string }>;
  isLoading: boolean;
}

export function VoiceCallTable({ calls, isLoading }: VoiceCallTableProps) {
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No voice calls yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="hidden md:table-header-group">
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transcript
            </th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <VoiceCallRow
              key={call.id}
              call={call}
              isExpanded={expandedCallId === call.id}
              onToggleExpand={() =>
                setExpandedCallId(expandedCallId === call.id ? null : call.id)
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
