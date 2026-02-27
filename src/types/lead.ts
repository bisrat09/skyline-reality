import type { PropertyType } from './listing';
import type { ChatMessage } from './chat';

export type LeadUrgency = 'hot' | 'warm' | 'cold';
export type LeadStatus = 'new' | 'contacted' | 'showing_booked' | 'closed';

export interface LeadData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  preferredNeighborhoods: string[];
  propertyTypePreference: PropertyType | null;
  bedroomsMin: number | null;
  status: LeadStatus;
  urgency: LeadUrgency;
  conversationTranscript: ChatMessage[];
  source: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedLeadFields {
  name?: string;
  email?: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  neighborhoods?: string[];
  bedrooms?: number;
  propertyType?: PropertyType;
}
