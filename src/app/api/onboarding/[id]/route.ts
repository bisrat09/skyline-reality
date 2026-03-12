import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import type { AgentListing } from '@/types/agent';

const RATE_LIMIT = { windowMs: 60_000, maxRequests: 10 };

const ALLOWED_FIELDS = ['chatGreeting', 'listings', 'calLink', 'name', 'brokerage', 'phone'];

function isValidListing(listing: unknown): listing is AgentListing {
  if (!listing || typeof listing !== 'object') return false;
  const l = listing as Record<string, unknown>;
  return (
    typeof l.id === 'string' &&
    typeof l.name === 'string' && l.name.length > 0 &&
    typeof l.address === 'string' && l.address.length > 0 &&
    typeof l.price === 'number' && l.price > 0 &&
    typeof l.bedrooms === 'number' && l.bedrooms >= 0 &&
    typeof l.bathrooms === 'number' && l.bathrooms >= 0
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit('onboarding-update', ip, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    );
  }

  const { id } = params;
  if (!id || id.length > 128) {
    return NextResponse.json(
      { success: false, error: 'Invalid agent ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Filter to allowed fields only
    const updates: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Validate chatGreeting
    if ('chatGreeting' in updates) {
      const greeting = updates.chatGreeting;
      if (typeof greeting !== 'string' || greeting.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Greeting must be a string (max 500 chars)' },
          { status: 400 }
        );
      }
    }

    // Validate listings
    if ('listings' in updates) {
      const listings = updates.listings;
      if (!Array.isArray(listings) || listings.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Listings must be an array (max 50)' },
          { status: 400 }
        );
      }
      for (const listing of listings) {
        if (!isValidListing(listing)) {
          return NextResponse.json(
            { success: false, error: 'Each listing must have name, address, price, bedrooms, bathrooms' },
            { status: 400 }
          );
        }
      }
    }

    // Validate calLink
    if ('calLink' in updates) {
      const link = updates.calLink;
      if (typeof link !== 'string' || link.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Calendar link must be a string (max 500 chars)' },
          { status: 400 }
        );
      }
    }

    const { updateAgent, getAgentById } = await import('@/lib/firestore/agents');

    // Verify agent exists
    const agent = await getAgentById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    await updateAgent(id, updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
