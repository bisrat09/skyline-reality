import { NextRequest, NextResponse } from 'next/server';
import { authenticateBearer } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

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
    const { getDashboardStats } = await import('@/lib/firestore/dashboardLeads');
    const stats = await getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
