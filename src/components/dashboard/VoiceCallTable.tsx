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
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-compass-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-compass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium">No voice calls yet</p>
        <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
          When callers reach your AI phone agent, their calls and transcripts will appear here.
        </p>
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
