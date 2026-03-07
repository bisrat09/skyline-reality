import { NextRequest, NextResponse } from 'next/server';
import type { LeadStatus, LeadUrgency } from '@/types/lead';
import type { LeadsQueryParams } from '@/types/dashboard';

function authenticate(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const password = process.env.DASHBOARD_PASSWORD;
  return !!password && authHeader === `Bearer ${password}`;
}

export async function GET(request: NextRequest) {
  if (!authenticate(request)) {
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
