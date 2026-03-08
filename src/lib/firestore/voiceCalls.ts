import type { VoiceCall, CallStatus } from '@/types/voice';
import type { ExtractedLeadFields } from '@/types/lead';

const COLLECTION = 'voice_calls';

export async function createVoiceCall(params: {
  vapiCallId: string;
  phoneNumber: string | null;
  status: CallStatus;
}): Promise<string> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const doc: Omit<VoiceCall, 'id'> = {
    vapiCallId: params.vapiCallId,
    phoneNumber: params.phoneNumber,
    leadId: null,
    status: params.status,
    duration: null,
    transcript: '',
    summary: null,
    recordingUrl: null,
    extractedFields: {},
    createdAt: now,
    updatedAt: now,
    endedAt: null,
  };

  const docRef = await adminDb.collection(COLLECTION).add(doc);
  return docRef.id;
}

export async function updateVoiceCall(
  id: string,
  updates: Partial<Omit<VoiceCall, 'id'>>
): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  await adminDb.collection(COLLECTION).doc(id).update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function getVoiceCallByVapiId(
  vapiCallId: string
): Promise<(VoiceCall & { id: string }) | null> {
  const { adminDb } = await import('@/lib/firebase/admin');

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('vapiCallId', '==', vapiCallId)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as VoiceCall & { id: string };
}

export async function getAllVoiceCalls(params?: {
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<Array<VoiceCall & { id: string }>> {
  const { adminDb } = await import('@/lib/firebase/admin');

  let ref: FirebaseFirestore.Query = adminDb
    .collection(COLLECTION)
    .orderBy('createdAt', 'desc');

  if (params?.limit) {
    ref = ref.limit(params.limit);
  }

  const snapshot = await ref.get();

  let calls = snapshot.docs.map(
    (doc: { id: string; data: () => Record<string, unknown> }) => ({
      id: doc.id,
      ...doc.data(),
    })
  ) as Array<VoiceCall & { id: string }>;

  // Client-side date filtering
  if (params?.startDate) {
    calls = calls.filter((c) => c.createdAt >= params.startDate!);
  }
  if (params?.endDate) {
    calls = calls.filter((c) => c.createdAt <= params.endDate!);
  }

  return calls;
}

export async function linkCallToLead(
  callId: string,
  leadId: string
): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  await adminDb.collection(COLLECTION).doc(callId).update({
    leadId,
    updatedAt: new Date().toISOString(),
  });
}
