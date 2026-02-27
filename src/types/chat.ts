export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    containsLeadInfo?: boolean;
    suggestedListings?: string[];
    bookingTriggered?: boolean;
  };
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}
