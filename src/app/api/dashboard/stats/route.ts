import { NextRequest, NextResponse } from 'next/server';

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
