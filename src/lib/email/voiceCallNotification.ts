import type { LeadUrgency } from '@/types/lead';
import type { EmailResult } from '@/types/email';
import { sendEmail } from './sendEmail';

interface NotifyVoiceCallParams {
  leadId: string;
  callId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  urgency: LeadUrgency;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  neighborhoods: string[];
  bedrooms: number | null;
  callDuration: number | null;
  transcript: string;
  recordingUrl: string | null;
}

export async function notifyVoiceCall(
  params: NotifyVoiceCallParams
): Promise<EmailResult> {
  const agentEmail = process.env.AGENT_EMAIL;
  if (!agentEmail) {
    return { success: false, error: 'No AGENT_EMAIL configured' };
  }

  const { buildVoiceCallSummaryEmail } = await import('./templates/voiceCallSummary');

  const { subject, html } = buildVoiceCallSummaryEmail({
    leadName: params.name,
    leadEmail: params.email,
    leadPhone: params.phone,
    urgency: params.urgency,
    budgetMin: params.budgetMin,
    budgetMax: params.budgetMax,
    timeline: params.timeline,
    preferredNeighborhoods: params.neighborhoods,
    bedroomsMin: params.bedrooms,
    callDuration: params.callDuration,
    transcript: params.transcript,
    recordingUrl: params.recordingUrl,
    leadId: params.leadId,
    callId: params.callId,
  });

  return sendEmail({ to: agentEmail, subject, html });
}
