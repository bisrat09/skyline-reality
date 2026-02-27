import type { ChatMessage } from './chat';
import type { PropertyListing } from './listing';
import type { PropertyType } from './listing';

export interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  sessionId: string;
}

export interface ChatStreamEvent {
  type: 'text_delta' | 'message_stop';
  text?: string;
  leadCaptured?: boolean;
}

export interface CreateLeadRequest {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  preferredNeighborhoods?: string[];
  propertyTypePreference?: PropertyType;
  bedroomsMin?: number;
  conversationTranscript: ChatMessage[];
}

export interface CreateLeadResponse {
  success: true;
  leadId: string;
}

export interface ListingsResponse {
  listings: PropertyListing[];
  total: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
