'use client';

import { cn } from '@/lib/utils/cn';
import { formatTime } from '@/lib/utils/formatDate';
import type { ChatMessage } from '@/types/chat';

function cleanTranscriptContent(content: string): string {
  return content
    .replace(/\[SUGGEST_PROPERTY:[^\]]+\]/g, '')
    .replace(/\[BOOK_SHOWING:[^\]]+\]/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface TranscriptViewProps {
  transcript: ChatMessage[];
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  if (!transcript || transcript.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4">
        No conversation transcript available.
      </p>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 py-4">
      {transcript.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'flex',
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'bg-navy-800 text-white'
                : 'bg-gray-100 text-gray-800'
            )}
          >
            <p className="whitespace-pre-wrap">{cleanTranscriptContent(msg.content)}</p>
            {msg.timestamp && (
              <p
                className={cn(
                  'text-[10px] mt-1',
                  msg.role === 'user' ? 'text-white/60' : 'text-gray-400'
                )}
              >
                {formatTime(msg.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
