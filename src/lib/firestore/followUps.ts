import type { FollowUp, FollowUpType, FollowUpStatus } from '@/types/email';

const COLLECTION = 'follow_ups';

const FOLLOW_UP_DELAYS: Record<FollowUpType, number> = {
  day1: 1,
  day3: 3,
  day7: 7,
};

/**
 * Calculate the scheduled date for a follow-up.
 * Schedules at 10:00 AM on the target day.
 */
export function calculateScheduledDate(
  createdAt: string,
  type: FollowUpType
): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + FOLLOW_UP_DELAYS[type]);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

/**
 * Schedule the Day 1/3/7 follow-up sequence for a new lead.
 * Creates 3 documents in the follow_ups collection via batch write.
 */
export async function scheduleFollowUps(params: {
  leadId: string;
  leadEmail: string;
  leadName: string | null;
  createdAt: string;
}): Promise<string[]> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const types: FollowUpType[] = ['day1', 'day3', 'day7'];
  const ids: string[] = [];

  const batch = adminDb.batch();

  for (const type of types) {
    const docRef = adminDb.collection(COLLECTION).doc();
    const followUp = {
      leadId: params.leadId,
      leadEmail: params.leadEmail,
      leadName: params.leadName,
      type,
      status: 'pending' as FollowUpStatus,
      scheduledAt: calculateScheduledDate(params.createdAt, type),
      sentAt: null,
      failedAt: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, followUp);
    ids.push(docRef.id);
  }

  await batch.commit();
  return ids;
}

/**
 * Get all pending follow-ups that are due (scheduledAt <= now).
 */
export async function getPendingFollowUps(): Promise<FollowUp[]> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('status', '==', 'pending')
    .where('scheduledAt', '<=', now)
    .get();

  return snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
    id: doc.id,
    ...doc.data(),
  })) as FollowUp[];
}

/**
 * Mark a follow-up as sent.
 */
export async function markFollowUpSent(id: string): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  await adminDb.collection(COLLECTION).doc(id).update({
    status: 'sent',
    sentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Mark a follow-up as failed.
 */
export async function markFollowUpFailed(id: string, reason: string): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  await adminDb.collection(COLLECTION).doc(id).update({
    status: 'failed',
    failedAt: new Date().toISOString(),
    failureReason: reason,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Cancel all pending follow-ups for a lead.
 */
export async function cancelFollowUpsForLead(leadId: string): Promise<void> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('leadId', '==', leadId)
    .where('status', '==', 'pending')
    .get();

  if (snapshot.empty) return;

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc: { ref: FirebaseFirestore.DocumentReference }) => {
    batch.update(doc.ref, { status: 'cancelled', updatedAt: now });
  });
  await batch.commit();
}
