import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { LeadData } from '@/types/lead';

const COLLECTION = 'leads';

export async function getLeadBySessionId(
  sessionId: string
): Promise<(LeadData & { id: string }) | null> {
  const q = query(collection(db, COLLECTION), where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as LeadData & { id: string };
}
