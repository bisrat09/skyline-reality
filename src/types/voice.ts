import type { ExtractedLeadFields } from './lead';

// --- Vapi Event Types ---

export type VapiEventType =
  | 'status-update'
  | 'end-of-call-report'
  | 'tool-calls'
  | 'conversation-update'
  | 'hang'
  | 'user-interrupted';

export type CallStatus =
  | 'queued'
  | 'ringing'
  | 'in-progress'
  | 'forwarding'
  | 'ended';

export interface VapiToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface VapiCallInfo {
  id: string;
  phoneNumberId?: string;
  customerId?: string;
  assistantId?: string;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
}

export interface VapiMessage {
  role: 'assistant' | 'user' | 'system' | 'tool';
  content: string;
  time: number;
  secondsFromStart: number;
}

// --- Webhook Events ---

export interface VapiToolCallEvent {
  type: 'tool-calls';
  call: VapiCallInfo;
  toolCallList: VapiToolCall[];
}

export interface VapiStatusUpdateEvent {
  type: 'status-update';
  status: CallStatus;
  call: VapiCallInfo;
  timestamp: string;
}

export interface VapiEndOfCallReportEvent {
  type: 'end-of-call-report';
  call: VapiCallInfo & { startedAt: string; endedAt: string };
  recordingUrl?: string;
  transcript: string;
  messages: VapiMessage[];
  summary?: string;
  endedReason?: string;
  phoneNumber?: string;
}

export type VapiWebhookEvent =
  | VapiToolCallEvent
  | VapiStatusUpdateEvent
  | VapiEndOfCallReportEvent
  | { type: VapiEventType; [key: string]: unknown };

// --- Webhook Response ---

export interface VapiToolCallResult {
  toolCallId: string;
  result: string;
}

export interface VapiToolCallResponse {
  results: VapiToolCallResult[];
}

// --- Firestore Voice Call Document ---

export interface VoiceCall {
  id: string;
  vapiCallId: string;
  phoneNumber: string | null;
  leadId: string | null;
  status: CallStatus;
  duration: number | null; // seconds
  transcript: string;
  summary: string | null;
  recordingUrl: string | null;
  extractedFields: ExtractedLeadFields;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
}

// --- Type Guards ---

export function isToolCallEvent(event: VapiWebhookEvent): event is VapiToolCallEvent {
  return event.type === 'tool-calls';
}

export function isStatusUpdateEvent(event: VapiWebhookEvent): event is VapiStatusUpdateEvent {
  return event.type === 'status-update';
}

export function isEndOfCallReportEvent(event: VapiWebhookEvent): event is VapiEndOfCallReportEvent {
  return event.type === 'end-of-call-report';
}
