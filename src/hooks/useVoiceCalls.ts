'use client';

import { useState, useCallback } from 'react';
import type { VoiceCall } from '@/types/voice';

interface UseVoiceCallsReturn {
  calls: Array<VoiceCall & { id: string }>;
  isLoading: boolean;
  error: string | null;
  fetchCalls: (authHeaders: Record<string, string>) => Promise<void>;
}

export function useVoiceCalls(): UseVoiceCallsReturn {
  const [calls, setCalls] = useState<Array<VoiceCall & { id: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = useCallback(
    async (authHeaders: Record<string, string>) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/dashboard/voice-calls', {
          headers: authHeaders,
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Unauthorized');
            return;
          }
          throw new Error(`Failed to fetch voice calls: ${res.status}`);
        }

        const data = await res.json();
        setCalls(data.calls || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch voice calls');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { calls, isLoading, error, fetchCalls };
}
