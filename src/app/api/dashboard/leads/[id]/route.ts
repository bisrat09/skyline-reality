import { NextRequest, NextResponse } from 'next/server';
import type { LeadStatus } from '@/types/lead';

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'showing_booked', 'closed'];

function authenticate(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const password = process.env.DASHBOARD_PASSWORD;
  return !!password && authHeader === `Bearer ${password}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authenticate(request)) {
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
