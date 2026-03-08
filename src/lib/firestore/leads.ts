import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { LeadData } from '@/types/lead';
import type { CreateLeadRequest } from '@/types/api';
import { calculateUrgency } from '@/lib/leadExtraction';

// Re-export for backwards compatibility
export { calculateUrgency };

const COLLECTION = 'leads';

export async function createLead(
  data: CreateLeadRequest
): Promise<string> {
  const now = new Date().toISOString();
  const urgency = calculateUrgency(data);

  const leadDoc = {
    name: data.name || null,
    email: data.email || null,
    phone: data.phone || null,
    budgetMin: data.budgetMin || null,
    budgetMax: data.budgetMax || null,
    timeline: data.timeline || null,
    preferredNeighborhoods: data.preferredNeighborhoods || [],
    propertyTypePreference: data.propertyTypePreference || null,
    bedroomsMin: data.bedroomsMin || null,
    status: 'new' as const,
    urgency,
    conversationTranscript: data.conversationTranscript,
    source: 'website_chat',
    sessionId: data.sessionId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, COLLECTION), leadDoc);
  return docRef.id;
}

export async function updateLead(
  id: string,
  data: Partial<LeadData>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function getLeadBySessionId(
  sessionId: string
): Promise<(LeadData & { id: string }) | null> {
  const q = query(collection(db, COLLECTION), where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as LeadData & { id: string };
}

export async function createOrUpdateLead(
  data: CreateLeadRequest
): Promise<string> {
  const existing = await getLeadBySessionId(data.sessionId);
  if (existing) {
    await updateLead(existing.id, {
      ...data,
      urgency: calculateUrgency(data),
    } as Partial<LeadData>);
    return existing.id;
  }
  return createLead(data);
}
