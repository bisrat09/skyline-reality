import { NextRequest, NextResponse } from 'next/server';
import { authenticateBearer } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import type { LeadStatus } from '@/types/lead';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'showing_booked', 'closed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { allowed } = checkRateLimit('dashboard-auth', getClientIp(request), {
    windowMs: 900_000,
    maxRequests: 10,
  });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  if (!authenticateBearer(request, 'DASHBOARD_PASSWORD')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: LeadStatus };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { updateLeadStatus } = await import('@/lib/firestore/dashboardLeads');
    await updateLeadStatus(id, status);

    return NextResponse.json({
      success: true,
      leadId: id,
      newStatus: status,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('Dashboard update lead error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    );
  }
}
