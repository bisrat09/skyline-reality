import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { isValidPhone } from '@/lib/utils/validators';

const RATE_LIMIT = { windowMs: 60_000, maxRequests: 5 };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit('onboarding', ip, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, brokerage, phone } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name is required (min 2 characters)' },
        { status: 400 }
      );
    }
    if (!brokerage || typeof brokerage !== 'string' || brokerage.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Brokerage is required' },
        { status: 400 }
      );
    }
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Valid phone number is required' },
        { status: 400 }
      );
    }

    const { createAgent } = await import('@/lib/firestore/agents');
    const agentId = await createAgent({
      name: name.trim(),
      brokerage: brokerage.trim(),
      phone: phone.trim(),
      chatGreeting: '',
      listings: [],
      calLink: '',
    });

    return NextResponse.json({ success: true, agentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit('onboarding', ip, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    );
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id || typeof id !== 'string' || id.length > 128) {
    return NextResponse.json(
      { success: false, error: 'Valid agent ID is required' },
      { status: 400 }
    );
  }

  try {
    const { getAgentById } = await import('@/lib/firestore/agents');
    const agent = await getAgentById(id);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, agent });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
