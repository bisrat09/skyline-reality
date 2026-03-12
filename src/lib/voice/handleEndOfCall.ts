import type { VapiEndOfCallReportEvent } from '@/types/voice';
import { extractLeadFields, extractUserLines } from '@/lib/leadExtraction';
import {
  createVoiceCall,
  updateVoiceCall,
  getVoiceCallByVapiId,
} from '@/lib/firestore/voiceCalls';

export async function handleEndOfCall(
  event: VapiEndOfCallReportEvent
): Promise<void> {
  const userContent = extractUserLines(event.transcript);
  const fields = extractLeadFields(userContent);

  // Calculate duration in seconds
  const startedAt = new Date(event.call.startedAt);
  const endedAt = new Date(event.call.endedAt);
  const duration = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

  // Use phone from event or from extracted fields
  const phoneNumber = event.phoneNumber || fields.phone || null;

  const callUpdates = {
    phoneNumber,
    status: 'ended' as const,
    duration,
    transcript: event.transcript,
    summary: event.summary || null,
    recordingUrl: event.recordingUrl || null,
    extractedFields: fields,
    endedAt: event.call.endedAt,
  };

  const existing = await getVoiceCallByVapiId(event.call.id);

  let callId: string;
  let existingLeadId: string | null = null;

  if (existing) {
    await updateVoiceCall(existing.id, callUpdates);
    callId = existing.id;
    existingLeadId = existing.leadId || null;
  } else {
    callId = await createVoiceCall({
      vapiCallId: event.call.id,
      phoneNumber,
      status: 'ended',
    });
    // Also update the full fields since createVoiceCall only sets basics
    await updateVoiceCall(callId, {
      duration,
      transcript: event.transcript,
      summary: event.summary || null,
      recordingUrl: event.recordingUrl || null,
      extractedFields: fields,
      endedAt: event.call.endedAt,
    });
  }

  // Create lead only if we have contact info AND no lead was already created for this call
  if (existingLeadId) {
    // Already processed — skip duplicate lead creation and notification
    return;
  }

  const hasContact = !!(fields.email || fields.phone || phoneNumber);
  if (hasContact) {
    const { createLeadFromVoiceCall } = await import('./createLeadFromVoiceCall');
    await createLeadFromVoiceCall({
      callId,
      fields: { ...fields, phone: fields.phone || phoneNumber || undefined },
      transcript: event.transcript,
      duration,
      recordingUrl: event.recordingUrl || null,
    });
  }
}
