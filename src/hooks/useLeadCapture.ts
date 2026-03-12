'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import type { ExtractedLeadFields } from '@/types/lead';
import {
  extractLeadFields,
  mergeFields,
  hasReachedThreshold,
} from '@/lib/leadExtraction';

// Re-export pure functions so existing imports still work
export { extractLeadFields, mergeFields, hasReachedThreshold };

interface UseLeadCaptureOptions {
  sessionId: string;
  /** Minimum fields required before auto-submitting (default: 2 — need at least email or phone + one more) */
  threshold?: number;
}

interface UseLeadCaptureReturn {
  capturedFields: ExtractedLeadFields;
  isSubmitted: boolean;
  isSubmitting: boolean;
  /** Process a user message to extract lead info */
  extractFromMessage: (content: string) => ExtractedLeadFields;
  /** Check messages and submit if threshold met */
  processAndSubmit: (messages: ChatMessage[]) => Promise<void>;
}

/** Serialize fields to a stable string for comparison */
function fieldFingerprint(fields: ExtractedLeadFields): string {
  return JSON.stringify({
    name: fields.name || '',
    email: fields.email || '',
    phone: fields.phone || '',
    budgetMin: fields.budgetMin || 0,
    budgetMax: fields.budgetMax || 0,
    timeline: fields.timeline || '',
    bedrooms: fields.bedrooms || 0,
    propertyType: fields.propertyType || '',
    neighborhoods: (fields.neighborhoods || []).slice().sort().join(','),
  });
}

export function useLeadCapture({
  sessionId,
  threshold = 2,
}: UseLeadCaptureOptions): UseLeadCaptureReturn {
  const [capturedFields, setCapturedFields] = useState<ExtractedLeadFields>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Fingerprint of the last successfully submitted fields */
  const lastSubmittedFingerprintRef = useRef<string | null>(null);

  const extractFromMessage = useCallback(
    (content: string): ExtractedLeadFields => {
      const newFields = extractLeadFields(content);
      const merged = mergeFields(capturedFields, newFields);
      setCapturedFields(merged);
      return newFields;
    },
    [capturedFields]
  );

  const processAndSubmit = useCallback(
    async (messages: ChatMessage[]) => {
      if (isSubmitting) return;

      // Re-extract from all user messages to get full picture
      let accumulated: ExtractedLeadFields = {};
      for (const msg of messages) {
        if (msg.role === 'user') {
          const fields = extractLeadFields(msg.content);
          accumulated = mergeFields(accumulated, fields);
        }
      }
      setCapturedFields(accumulated);

      if (!hasReachedThreshold(accumulated, threshold)) return;

      // Skip if fields haven't changed since last successful submit
      const currentFingerprint = fieldFingerprint(accumulated);
      if (lastSubmittedFingerprintRef.current === currentFingerprint) return;

      setIsSubmitting(true);

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            name: accumulated.name,
            email: accumulated.email,
            phone: accumulated.phone,
            budgetMin: accumulated.budgetMin,
            budgetMax: accumulated.budgetMax,
            timeline: accumulated.timeline,
            preferredNeighborhoods: accumulated.neighborhoods,
            propertyTypePreference: accumulated.propertyType,
            bedroomsMin: accumulated.bedrooms,
            conversationTranscript: messages,
          }),
        });

        if (response.ok) {
          lastSubmittedFingerprintRef.current = currentFingerprint;
          setIsSubmitted(true);
        }
      } catch {
        // Network error — allow retry on next call
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, threshold, isSubmitting]
  );

  return { capturedFields, isSubmitted, isSubmitting, extractFromMessage, processAndSubmit };
}
