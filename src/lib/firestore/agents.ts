import type { AgentConfig } from '@/types/agent';

const COLLECTION = 'agents';

export async function createAgent(
  data: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const docRef = await adminDb.collection(COLLECTION).add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function getAgentById(id: string): Promise<AgentConfig | null> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const doc = await adminDb.collection(COLLECTION).doc(id).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as AgentConfig;
}

export async function updateAgent(
  id: string,
  data: Partial<Omit<AgentConfig, 'id' | 'createdAt'>>
): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  await adminDb
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...data,
      updatedAt: now,
    });
}
