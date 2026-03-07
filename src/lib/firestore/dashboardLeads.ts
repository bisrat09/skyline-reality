import type { LeadData, LeadStatus, LeadUrgency } from '@/types/lead';
import type { DashboardLead, LeadsQueryParams, DashboardStats } from '@/types/dashboard';

const COLLECTION = 'leads';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'showing_booked', 'closed'];

/**
 * Get all leads with optional filters and pagination.
 */
export async function getAllLeads(
  params: LeadsQueryParams = {}
): Promise<{ leads: DashboardLead[]; total: number }> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const { status, urgency, startDate, endDate, page = 1, limit = 20 } = params;

  let ref: FirebaseFirestore.Query = adminDb.collection(COLLECTION);

  if (status) {
    ref = ref.where('status', '==', status);
  }
  if (urgency) {
    ref = ref.where('urgency', '==', urgency);
  }

  ref = ref.orderBy('createdAt', 'desc');

  const snapshot = await ref.get();

  let leads = snapshot.docs.map(
    (doc: { id: string; data: () => Record<string, unknown> }) => ({
      id: doc.id,
      ...doc.data(),
    })
  ) as DashboardLead[];

  // Client-side date filtering (Firestore doesn't support inequality on multiple fields)
  if (startDate) {
    leads = leads.filter((l) => l.createdAt >= startDate);
  }
  if (endDate) {
    leads = leads.filter((l) => l.createdAt <= endDate);
  }

  const total = leads.length;
  const offset = (page - 1) * limit;
  const paginated = leads.slice(offset, offset + limit);

  return { leads: paginated, total };
}

/**
 * Get a single lead by ID.
 */
export async function getLeadById(id: string): Promise<DashboardLead | null> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const doc = await adminDb.collection(COLLECTION).doc(id).get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as DashboardLead;
}

/**
 * Update a lead's status. Records statusChangedAt for response time tracking.
 */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<void> {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const { adminDb } = await import('@/lib/firebase/admin');
  const now = new Date().toISOString();

  const updateData: Record<string, string> = {
    status,
    updatedAt: now,
  };

  // Record when lead was first contacted (for response time calculation)
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  if (!doc.exists) {
    throw new Error(`Lead not found: ${id}`);
  }

  const currentData = doc.data() as LeadData;
  if (currentData.status === 'new' && status !== 'new') {
    updateData.statusChangedAt = now;
  }

  await adminDb.collection(COLLECTION).doc(id).update(updateData);
}

/**
 * Compute dashboard analytics from all leads.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { adminDb } = await import('@/lib/firebase/admin');
  const snapshot = await adminDb.collection(COLLECTION).get();

  const leads = snapshot.docs.map(
    (doc: { data: () => Record<string, unknown> }) => doc.data()
  ) as (LeadData & { statusChangedAt?: string })[];

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const byStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    showing_booked: 0,
    closed: 0,
  };
  const byUrgency: Record<LeadUrgency, number> = {
    hot: 0,
    warm: 0,
    cold: 0,
  };

  let leadsThisWeek = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;
  let closedCount = 0;

  for (const lead of leads) {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    byUrgency[lead.urgency] = (byUrgency[lead.urgency] || 0) + 1;

    if (lead.createdAt >= weekAgoStr) {
      leadsThisWeek++;
    }

    if (lead.statusChangedAt && lead.createdAt) {
      const created = new Date(lead.createdAt).getTime();
      const changed = new Date(lead.statusChangedAt).getTime();
      if (changed > created) {
        totalResponseTime += changed - created;
        responseTimeCount++;
      }
    }

    if (lead.status === 'closed') {
      closedCount++;
    }
  }

  const totalLeads = leads.length;
  const avgResponseTimeMinutes =
    responseTimeCount > 0
      ? Math.round(totalResponseTime / responseTimeCount / 60000)
      : null;
  const conversionRate =
    totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    leadsThisWeek,
    byStatus,
    byUrgency,
    avgResponseTimeMinutes,
    conversionRate,
  };
}
