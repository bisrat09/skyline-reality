/**
 * @jest-environment node
 */

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
    console.error('Dashboard voice calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice calls' },
      { status: 500 }
    );
  }
}
