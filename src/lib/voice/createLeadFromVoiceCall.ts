import type { ExtractedLeadFields } from '@/types/lead';
import type { ChatMessage } from '@/types/chat';
import { calculateUrgency } from '@/lib/firestore/leads';
import { linkCallToLead } from '@/lib/firestore/voiceCalls';

interface CreateLeadFromCallParams {
  callId: string;
  fields: ExtractedLeadFields;
  transcript: string;
  duration: number;
  recordingUrl: string | null;
}

export async function createLeadFromVoiceCall(
  params: CreateLeadFromCallParams
): Promise<string> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  // Convert transcript to ChatMessage format for consistent storage
  const conversationTranscript: ChatMessage[] = [
    {
      id: `voice-${params.callId}`,
      role: 'user',
      content: `[Voice call transcript]\n${params.transcript}`,
      timestamp: now,
    },
  ];

  const urgency = calculateUrgency({
    name: params.fields.name,
    email: params.fields.email,
    phone: params.fields.phone,
    budgetMin: params.fields.budgetMin,
    budgetMax: params.fields.budgetMax,
    timeline: params.fields.timeline,
    preferredNeighborhoods: params.fields.neighborhoods,
    bedroomsMin: params.fields.bedrooms,
  });

  const leadDoc = {
    name: params.fields.name || null,
    email: params.fields.email || null,
    phone: params.fields.phone || null,
    budgetMin: params.fields.budgetMin || null,
    budgetMax: params.fields.budgetMax || null,
    timeline: params.fields.timeline || null,
    preferredNeighborhoods: params.fields.neighborhoods || [],
    propertyTypePreference: params.fields.propertyType || null,
    bedroomsMin: params.fields.bedrooms || null,
    status: 'new',
    urgency,
    conversationTranscript,
    source: 'voice_call',
    sessionId: params.callId,
    followUpScheduled: false,
    welcomeEmailSent: false,
    agentNotificationSent: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await adminDb.collection('leads').add(leadDoc);

  // Link voice call to the new lead
  await linkCallToLead(params.callId, docRef.id);

  // Send agent notification (fire-and-forget)
  try {
    const { notifyVoiceCall } = await import('@/lib/email/voiceCallNotification');
    await notifyVoiceCall({
      leadId: docRef.id,
      callId: params.callId,
      name: params.fields.name || null,
      email: params.fields.email || null,
      phone: params.fields.phone || null,
      urgency,
      budgetMin: params.fields.budgetMin || null,
      budgetMax: params.fields.budgetMax || null,
      timeline: params.fields.timeline || null,
      neighborhoods: params.fields.neighborhoods || [],
      bedrooms: params.fields.bedrooms || null,
      callDuration: params.duration,
      transcript: params.transcript,
      recordingUrl: params.recordingUrl,
    });
  } catch (error) {
    console.error('Voice call notification error (non-blocking):', error);
  }

  return docRef.id;
}
