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
    const { getAllVoiceCalls } = await import('@/lib/firestore/voiceCalls');

    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const calls = await getAllVoiceCalls({
      limit: limit ? parseInt(limit, 10) : 50,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json({ calls, total: calls.length });
  } catch (error) {
    console.error('Dashboard voice calls error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch voice calls' },
      { status: 500 }
    );
  }
}
