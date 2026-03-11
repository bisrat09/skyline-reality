import { NextRequest, NextResponse } from 'next/server';
import { authenticateBearer } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import type { LeadStatus, LeadUrgency } from '@/types/lead';
import type { LeadsQueryParams } from '@/types/dashboard';

export async function GET(request: NextRequest) {
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
    const { getAllLeads } = await import('@/lib/firestore/dashboardLeads');

    const url = new URL(request.url);
    const params: LeadsQueryParams = {};

    const status = url.searchParams.get('status');
    if (status) params.status = status as LeadStatus;

    const urgency = url.searchParams.get('urgency');
    if (urgency) params.urgency = urgency as LeadUrgency;

    const startDate = url.searchParams.get('startDate');
    if (startDate) params.startDate = startDate;

    const endDate = url.searchParams.get('endDate');
    if (endDate) params.endDate = endDate;

    const page = url.searchParams.get('page');
    if (page) params.page = parseInt(page, 10);

    const limit = url.searchParams.get('limit');
    if (limit) params.limit = parseInt(limit, 10);

    const result = await getAllLeads(params);

    return NextResponse.json({
      leads: result.leads,
      total: result.total,
      page: params.page || 1,
      limit: params.limit || 20,
    });
  } catch (error) {
    console.error('Dashboard leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
