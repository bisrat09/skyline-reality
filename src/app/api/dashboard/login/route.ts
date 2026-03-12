import { NextRequest, NextResponse } from 'next/server';
import { authenticateBearer } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const { allowed } = checkRateLimit('dashboard-login', getClientIp(request), {
    windowMs: 900_000,   // 15 minutes
    maxRequests: 10,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  if (!authenticateBearer(request, 'DASHBOARD_PASSWORD')) {
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
