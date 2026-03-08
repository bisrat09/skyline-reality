'use client';

import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/formatDate';
import type { VoiceCall } from '@/types/voice';

interface VoiceCallRowProps {
  call: VoiceCall & { id: string };
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function VoiceCallRow({
  call,
  isExpanded,
  onToggleExpand,
}: VoiceCallRowProps) {
  return (
    <>
      {/* Desktop row */}
      <tr className="hidden md:table-row border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-gray-900">
          {call.phoneNumber || 'Unknown'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatDuration(call.duration)}
        </td>
        <td className="px-4 py-3">
          <Badge variant={call.status === 'ended' ? 'success' : 'default'}>
            {call.status}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm">
          {call.leadId ? (
            <span className="text-compass-500 font-medium">Linked</span>
          ) : (
            <span className="text-gray-400">No lead</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {formatDate(call.createdAt)}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggleExpand}
            className="text-sm text-compass-500 hover:text-compass-600 font-medium"
            aria-label={isExpanded ? 'Hide transcript' : 'Show transcript'}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </td>
      </tr>

      {/* Desktop transcript row */}
      {isExpanded && (
        <tr className="hidden md:table-row border-b border-gray-200 bg-gray-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="space-y-2">
              {call.summary && (
                <p className="text-sm text-gray-700 font-medium">
                  Summary: {call.summary}
                </p>
              )}
              {call.recordingUrl && (
                <a
                  href={call.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-compass-500 hover:text-compass-600"
                >
                  Listen to Recording
                </a>
              )}
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {call.transcript || 'No transcript available.'}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Mobile card */}
      <tr className="md:hidden">
        <td colSpan={6} className="p-0">
          <div className="border-b border-gray-100 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">
                {call.phoneNumber || 'Unknown'}
              </p>
              <Badge variant={call.status === 'ended' ? 'success' : 'default'}>
                {call.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Duration: {formatDuration(call.duration)}
              </span>
              <span className="text-gray-400">{formatDate(call.createdAt)}</span>
            </div>
            <button
              onClick={onToggleExpand}
              className="text-sm text-compass-500 hover:text-compass-600 font-medium"
            >
              {isExpanded ? 'Hide' : 'Show'} Transcript
            </button>
            {isExpanded && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {call.transcript || 'No transcript available.'}
                </p>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}
