import type { LeadUrgency } from './lead';

export type FollowUpType = 'day1' | 'day3' | 'day7';
export type FollowUpStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface FollowUp {
  id: string;
  leadId: string;
  leadEmail: string;
  leadName: string | null;
  type: FollowUpType;
  status: FollowUpStatus;
  scheduledAt: string;
  sentAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface AgentNotificationData {
  leadName: string | null;
  leadEmail: string | null;
  leadPhone: string | null;
  urgency: LeadUrgency;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  preferredNeighborhoods: string[];
  bedroomsMin: number | null;
  propertyTypePreference: string | null;
  conversationHighlights: string[];
  leadId: string;
}

export interface LeadWelcomeData {
  leadName: string | null;
  preferredNeighborhoods: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  bedroomsMin: number | null;
  propertyTypePreference: string | null;
}

export interface FollowUpEmailData {
  leadName: string | null;
  preferredNeighborhoods: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  type: FollowUpType;
}
