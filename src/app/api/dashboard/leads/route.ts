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

    const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'showing_booked', 'closed'];
    const VALID_URGENCIES: LeadUrgency[] = ['hot', 'warm', 'cold'];

    const url = new URL(request.url);
    const params: LeadsQueryParams = {};

    const status = url.searchParams.get('status');
    if (status) {
      if (!VALID_STATUSES.includes(status as LeadStatus)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
      }
      params.status = status as LeadStatus;
    }

    const urgency = url.searchParams.get('urgency');
    if (urgency) {
      if (!VALID_URGENCIES.includes(urgency as LeadUrgency)) {
        return NextResponse.json({ error: 'Invalid urgency filter' }, { status: 400 });
      }
      params.urgency = urgency as LeadUrgency;
    }

    const startDate = url.searchParams.get('startDate');
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
    }
    if (startDate) params.startDate = startDate;

    const endDate = url.searchParams.get('endDate');
    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
    }
    if (endDate) params.endDate = endDate;

    const page = url.searchParams.get('page');
    if (page) {
      const p = parseInt(page, 10);
      if (isNaN(p) || p < 1) {
        return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
      }
      params.page = p;
    }

    const limit = url.searchParams.get('limit');
    if (limit) {
      const l = parseInt(limit, 10);
      if (isNaN(l) || l < 1 || l > 100) {
        return NextResponse.json({ error: 'Invalid limit (must be 1-100)' }, { status: 400 });
      }
      params.limit = l;
    }

    const result = await getAllLeads(params);

    return NextResponse.json({
      leads: result.leads,
      total: result.total,
      page: params.page || 1,
      limit: params.limit || 20,
    });
  } catch (error) {
    console.error('Dashboard leads error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
