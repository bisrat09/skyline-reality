import type { AgentNotificationData, LeadWelcomeData, EmailResult } from '@/types/email';
import type { LeadUrgency } from '@/types/lead';
import type { ChatMessage } from '@/types/chat';
import { sendEmail } from './sendEmail';
import { buildAgentNotificationEmail } from './templates/agentNotification';
import { buildLeadWelcomeEmail } from './templates/leadWelcome';
import { isValidEmail } from '@/lib/utils/validators';

interface NotifyNewLeadParams {
  leadId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  urgency: LeadUrgency;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  preferredNeighborhoods: string[];
  bedroomsMin: number | null;
  propertyTypePreference: string | null;
  conversationTranscript: ChatMessage[];
}

/**
 * Extract key user messages from transcript for agent notification.
 */
export function extractConversationHighlights(
  transcript: ChatMessage[],
  maxHighlights: number = 5
): string[] {
  return transcript
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .filter((c) => c.length > 10)
    .slice(0, maxHighlights)
    .map((c) => (c.length > 150 ? c.substring(0, 147) + '...' : c));
}

/**
 * Send instant notifications for a new lead:
 * 1. Agent gets a summary email with urgency + contact info
 * 2. Lead gets a personalized welcome email
 */
export async function notifyNewLead(params: NotifyNewLeadParams): Promise<{
  agentNotification: EmailResult;
  leadWelcome: EmailResult;
}> {
  const agentEmail = process.env.AGENT_EMAIL;
  const results = {
    agentNotification: { success: false, error: 'Not sent' } as EmailResult,
    leadWelcome: { success: false, error: 'Not sent' } as EmailResult,
  };

  const highlights = extractConversationHighlights(params.conversationTranscript);

  const promises: Promise<void>[] = [];

  // 1. Agent notification
  if (agentEmail && isValidEmail(agentEmail)) {
    const notificationData: AgentNotificationData = {
      leadName: params.name,
      leadEmail: params.email,
      leadPhone: params.phone,
      urgency: params.urgency,
      budgetMin: params.budgetMin,
      budgetMax: params.budgetMax,
      timeline: params.timeline,
      preferredNeighborhoods: params.preferredNeighborhoods,
      bedroomsMin: params.bedroomsMin,
      propertyTypePreference: params.propertyTypePreference,
      conversationHighlights: highlights,
      leadId: params.leadId,
    };
    const { subject, html } = buildAgentNotificationEmail(notificationData);
    promises.push(
      sendEmail({ to: agentEmail, subject, html }).then((r) => {
        results.agentNotification = r;
      })
    );
  }

  // 2. Lead welcome email
  if (params.email && isValidEmail(params.email)) {
    const welcomeData: LeadWelcomeData = {
      leadName: params.name,
      preferredNeighborhoods: params.preferredNeighborhoods,
      budgetMin: params.budgetMin,
      budgetMax: params.budgetMax,
      bedroomsMin: params.bedroomsMin,
      propertyTypePreference: params.propertyTypePreference,
    };
    const { subject, html } = buildLeadWelcomeEmail(welcomeData);
    promises.push(
      sendEmail({ to: params.email, subject, html, replyTo: agentEmail }).then((r) => {
        results.leadWelcome = r;
      })
    );
  }

  await Promise.all(promises);
  return results;
}
