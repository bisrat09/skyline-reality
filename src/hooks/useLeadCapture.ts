'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import type { ExtractedLeadFields } from '@/types/lead';
import { isValidEmail, isValidPhone } from '@/lib/utils/validators';

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

// Seattle neighborhoods for matching
const SEATTLE_NEIGHBORHOODS = [
  'Capitol Hill', 'Ballard', 'Fremont', 'Queen Anne', 'Wallingford',
  'Green Lake', 'Beacon Hill', 'Columbia City', 'West Seattle', 'Magnolia',
  'Ravenna', 'University District', 'U-District', 'Georgetown', 'SoDo',
  'Pioneer Square', 'Downtown', 'South Lake Union', 'Eastlake', 'Madison Park',
  'Madrona', 'Central District', 'Rainier Valley', 'Northgate', 'Lake City',
];

// Regex patterns for lead field extraction
const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
const BUDGET_REGEX_DOLLAR = /\$\s?([\d,]+)\s?[kKmM]?\b/g;
const BUDGET_REGEX_WORD = /\b(?:budget|price|max|afford|spend|around|under|up to)\s+\$?\s?([\d,]+)\s?[kKmM]?\b/gi;
const BEDROOMS_REGEX = /(\d)\s*(?:bed(?:room)?s?|bd|br)\b/i;

/**
 * Extract lead fields from a single message string.
 * Pure function — no side effects.
 */
export function extractLeadFields(content: string): ExtractedLeadFields {
  const fields: ExtractedLeadFields = {};

  // Email
  const emailMatch = content.match(EMAIL_REGEX);
  if (emailMatch && isValidEmail(emailMatch[0])) {
    fields.email = emailMatch[0];
  }

  // Phone
  const phoneMatch = content.match(PHONE_REGEX);
  if (phoneMatch && isValidPhone(phoneMatch[0])) {
    fields.phone = phoneMatch[0];
  }

  // Budget (find dollar amounts from "$500K" or "budget 500000")
  const budgetMatches: number[] = [];
  let match;
  for (const regex of [BUDGET_REGEX_DOLLAR, BUDGET_REGEX_WORD]) {
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      let amount = parseInt(match[1].replace(/,/g, ''), 10);
      // Handle "K" (thousands) and "M" (millions) suffixes
      const lastChar = match[0].charAt(match[0].length - 1);
      const afterChar = content.charAt(match.index + match[0].length);
      if (/[mM]/.test(lastChar) || (amount < 1000 && /[mM]/.test(afterChar))) {
        amount *= 1000000;
      } else if (/[kK]/.test(lastChar) || (amount < 10000 && /[kK]/.test(afterChar))) {
        amount *= 1000;
      }
      if (amount > 0) budgetMatches.push(amount);
    }
  }
  // Deduplicate
  const uniqueBudgets = Array.from(new Set(budgetMatches));
  if (uniqueBudgets.length >= 2) {
    fields.budgetMin = Math.min(...uniqueBudgets);
    fields.budgetMax = Math.max(...uniqueBudgets);
  } else if (uniqueBudgets.length === 1) {
    // Single budget: treat as max with 20% lower bound
    fields.budgetMax = uniqueBudgets[0];
    fields.budgetMin = Math.round(uniqueBudgets[0] * 0.8);
  }

  // Bedrooms
  const bedroomMatch = content.match(BEDROOMS_REGEX);
  if (bedroomMatch) {
    fields.bedrooms = parseInt(bedroomMatch[1], 10);
  }

  // Neighborhoods (fuzzy: "Queen Ann" matches "Queen Anne", etc.)
  const lowerContent = content.toLowerCase();
  const matchedNeighborhoods = SEATTLE_NEIGHBORHOODS.filter((n) => {
    const lower = n.toLowerCase();
    // Exact substring match OR content contains the neighborhood minus trailing 'e'/'s'
    return lowerContent.includes(lower) ||
      lowerContent.includes(lower.replace(/e$/, '')) ||
      lower.includes(lowerContent.match(new RegExp(lower.replace(/e$/, ''), 'i'))?.[0] || '___');
  });
  if (matchedNeighborhoods.length > 0) {
    fields.neighborhoods = matchedNeighborhoods;
  }

  // Name detection — "I'm [Name]", "My name is [Name]", "This is [Name]"
  const nameMatch = content.match(
    /(?:(?:I'm|I am|my name is|this is|call me)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  if (nameMatch) {
    fields.name = nameMatch[1];
  }

  // Timeline
  const timelinePatterns = [
    /\b(asap|immediately|right away|as soon as possible)\b/i,
    /\b(this month|next month|within a month)\b/i,
    /\b(1-3 months|one to three months)\b/i,
    /\b(3-6 months|three to six months)\b/i,
    /\b(6-12 months|six to twelve months)\b/i,
    /\b(this year|next year|within a year)\b/i,
    /\b(just (browsing|looking)|no rush)\b/i,
    /\b(?:in|within|about|around)\s+(\d+)\s+months?\b/i,
    /\b(\d+)\s+months?\s+(?:from now|or so)\b/i,
  ];
  for (const pattern of timelinePatterns) {
    const tMatch = content.match(pattern);
    if (tMatch) {
      fields.timeline = tMatch[0];
      break;
    }
  }

  // Property type
  if (/\bcondo(?:minium)?s?\b/i.test(content)) {
    fields.propertyType = 'condo';
  } else if (/\btownhouse?s?\b/i.test(content) || /\btownhome?s?\b/i.test(content)) {
    fields.propertyType = 'townhouse';
  } else if (/\bsingle[\s-]?family\b/i.test(content) || /\bhouse\b/i.test(content) || /\bfamily\s+home\b/i.test(content) || /\bhome\b/i.test(content)) {
    fields.propertyType = 'single_family';
  }

  return fields;
}

/**
 * Merge new fields into existing accumulated fields.
 * New values overwrite old ones; arrays are merged.
 */
export function mergeFields(
  existing: ExtractedLeadFields,
  newFields: ExtractedLeadFields
): ExtractedLeadFields {
  const merged = { ...existing };

  if (newFields.name) merged.name = newFields.name;
  if (newFields.email) merged.email = newFields.email;
  if (newFields.phone) merged.phone = newFields.phone;
  if (newFields.budgetMin) merged.budgetMin = newFields.budgetMin;
  if (newFields.budgetMax) merged.budgetMax = newFields.budgetMax;
  if (newFields.timeline) merged.timeline = newFields.timeline;
  if (newFields.bedrooms) merged.bedrooms = newFields.bedrooms;
  if (newFields.propertyType) merged.propertyType = newFields.propertyType;

  if (newFields.neighborhoods) {
    const existing_n = merged.neighborhoods || [];
    merged.neighborhoods = Array.from(new Set([...existing_n, ...newFields.neighborhoods]));
  }

  return merged;
}

/**
 * Check if we have enough info to submit a lead.
 * Requires at least email or phone, plus one additional field.
 */
export function hasReachedThreshold(
  fields: ExtractedLeadFields,
  threshold: number = 2
): boolean {
  const hasContact = !!(fields.email || fields.phone);
  if (!hasContact) return false;

  let count = 0;
  if (fields.email) count++;
  if (fields.phone) count++;
  if (fields.name) count++;
  if (fields.budgetMin || fields.budgetMax) count++;
  if (fields.timeline) count++;
  if (fields.neighborhoods?.length) count++;
  if (fields.bedrooms) count++;
  if (fields.propertyType) count++;

  return count >= threshold;
}

export function useLeadCapture({
  sessionId,
  threshold = 2,
}: UseLeadCaptureOptions): UseLeadCaptureReturn {
  const [capturedFields, setCapturedFields] = useState<ExtractedLeadFields>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittedRef = useRef(false);

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
      if (submittedRef.current || isSubmitting) return;

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

      submittedRef.current = true;
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
          setIsSubmitted(true);
        } else {
          // Allow retry
          submittedRef.current = false;
        }
      } catch {
        submittedRef.current = false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, threshold, isSubmitting]
  );

  return { capturedFields, isSubmitted, isSubmitting, extractFromMessage, processAndSubmit };
}
