import type { ExtractedLeadFields, LeadUrgency } from '@/types/lead';
import type { CreateLeadRequest } from '@/types/api';
import { isValidEmail, isValidPhone } from '@/lib/utils/validators';

/**
 * Calculate lead urgency based on available info.
 * Pure function — safe for server-side use.
 */
export function calculateUrgency(lead: Partial<CreateLeadRequest>): LeadUrgency {
  let score = 0;

  if (lead.email) score += 2;
  if (lead.phone) score += 2;
  if (lead.name) score += 1;
  if (lead.budgetMin || lead.budgetMax) score += 2;
  if (lead.preferredNeighborhoods?.length) score += 1;
  if (lead.bedroomsMin) score += 1;

  if (lead.timeline) {
    const tl = lead.timeline.toLowerCase();
    if (['asap', 'immediately', '1-3 months', 'this month'].some((k) => tl.includes(k))) {
      score += 3;
    } else if (['3-6 months', 'this year'].some((k) => tl.includes(k))) {
      score += 1;
    }
  }

  if (score >= 8) return 'hot';
  if (score >= 4) return 'warm';
  return 'cold';
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
const BUDGET_REGEX_DOLLAR = /\$\s?([\d,.]+)\s?(?:million|mil|[kKmM])?\b/g;
const BUDGET_REGEX_WORD = /\b(?:budget|price|max|afford|spend|around|under|up to)\s+\$?\s?([\d,.]+)\s?(?:million|mil|[kKmM])?\b/gi;
const BEDROOMS_REGEX = /(\d)\s*(?:bed(?:room)?s?|bd|br)\b/i;

/**
 * Extract only user/caller lines from a voice transcript.
 * Filters out AI/Assistant lines so extraction only parses what the caller said.
 */
export function extractUserLines(transcript: string): string {
  return transcript
    .split('\n')
    .filter((line) => /^(?:User|Caller|Customer)\s*:/i.test(line))
    .map((line) => line.replace(/^(?:User|Caller|Customer)\s*:\s*/i, ''))
    .join('\n');
}

/**
 * Extract lead fields from a single message string.
 * Pure function — no side effects.
 */
export function extractLeadFields(content: string): ExtractedLeadFields {
  const fields: ExtractedLeadFields = {};

  // Email (strip trailing periods that aren't part of the domain)
  const emailMatch = content.match(EMAIL_REGEX);
  if (emailMatch) {
    const email = emailMatch[0].replace(/\.+$/, '');
    if (isValidEmail(email)) {
      fields.email = email;
    }
  }

  // Phone
  const phoneMatch = content.match(PHONE_REGEX);
  if (phoneMatch && isValidPhone(phoneMatch[0])) {
    fields.phone = phoneMatch[0];
  }

  // Budget (find dollar amounts from "$500K", "budget 500000", "1.2 million")
  const budgetMatches: number[] = [];
  let match;
  for (const regex of [BUDGET_REGEX_DOLLAR, BUDGET_REGEX_WORD]) {
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      // Handle suffix: "million"/"mil"/"M" or "K"
      const suffix = match[0].toLowerCase();
      if (/million|mil$/.test(suffix) || /[mM]$/.test(match[0])) {
        amount *= 1000000;
      } else if (/[kK]$/.test(match[0])) {
        amount *= 1000;
      }
      amount = Math.round(amount);
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

  // Name detection — "I'm [Name]", "My name is [Name]", "This is [Name]", "call me [Name]"
  // Blocklist: common words that follow "I'm", "call me", etc. but are not names
  const NAME_BLOCKLIST = new Set([
    'looking', 'searching', 'interested', 'wondering', 'hoping', 'trying',
    'thinking', 'planning', 'moving', 'buying', 'selling', 'renting',
    'calling', 'emailing', 'reaching', 'contacting', 'writing',
    'ready', 'available', 'free', 'busy', 'new', 'here', 'back',
    'not', 'very', 'really', 'just', 'also', 'still', 'currently',
    'sorry', 'happy', 'glad', 'sure', 'fine', 'good', 'great', 'ok',
    'tomorrow', 'today', 'later', 'soon', 'now', 'never', 'always',
    'in', 'at', 'on', 'for', 'from', 'with', 'about', 'around',
    'a', 'an', 'the', 'this', 'that', 'these', 'those',
  ]);
  const nameMatch = content.match(
    /(?:(?:I'm|I am|my name is|this is|call me)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  );
  if (nameMatch) {
    const candidate = nameMatch[1];
    const firstWord = candidate.split(/\s+/)[0].toLowerCase();
    if (!NAME_BLOCKLIST.has(firstWord)) {
      fields.name = candidate;
    }
  }

  // Timeline
  const timelinePatterns = [
    /\b(asap|immediately|right away|as soon as possible)\b/i,
    /\b(this month|next month|within a month)\b/i,
    /\b(1-3 months|one to three months|1 to 3 months)\b/i,
    /\b(3-6 months|three to six months|3 to 6 months)\b/i,
    /\b(6-12 months|six to twelve months|6 to 12 months)\b/i,
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
