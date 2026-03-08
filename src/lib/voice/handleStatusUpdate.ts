import type { VapiStatusUpdateEvent } from '@/types/voice';
import {
  createVoiceCall,
  updateVoiceCall,
  getVoiceCallByVapiId,
} from '@/lib/firestore/voiceCalls';

export async function handleStatusUpdate(
  event: VapiStatusUpdateEvent
): Promise<void> {
  const existing = await getVoiceCallByVapiId(event.call.id);

  if (!existing && event.status === 'in-progress') {
    await createVoiceCall({
      vapiCallId: event.call.id,
      phoneNumber: null,
      status: event.status,
    });
  } else if (existing) {
    await updateVoiceCall(existing.id, { status: event.status });
  }
}
