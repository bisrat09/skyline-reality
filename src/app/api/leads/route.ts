import { NextRequest, NextResponse } from 'next/server';
import type { CreateLeadRequest } from '@/types/api';
import type { LeadUrgency } from '@/types/lead';

function calculateUrgency(lead: Partial<CreateLeadRequest>): LeadUrgency {
  let score = 0;
  if (lead.email) score += 2;
  if (lead.phone) score += 2;
  if (lead.name) score += 1;
  if (lead.budgetMin || lead.budgetMax) score += 2;
  if (lead.preferredNeighborhoods?.length) score += 1;
  if (lead.bedroomsMin) score += 1;

  if (lead.timeline) {
    const tl = lead.timeline.toLowerCase();
    if (['asap', 'immediately', '1-3 months', 'this month'].some((k) => tl.includes(k))) {
      score += 3;
    } else if (['3-6 months', 'this year'].some((k) => tl.includes(k))) {
      score += 1;
    }
  }

  if (score >= 8) return 'hot';
  if (score >= 4) return 'warm';
  return 'cold';
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLeadRequest = await request.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (!body.email && !body.phone) {
      return NextResponse.json(
        { success: false, error: 'At least one contact method (email or phone) is required' },
        { status: 400 }
      );
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const now = new Date().toISOString();
    const urgency = calculateUrgency(body);

    // Check for existing lead with this session
    const existingSnapshot = await adminDb
      .collection('leads')
      .where('sessionId', '==', body.sessionId)
      .get();

    if (!existingSnapshot.empty) {
      const existingDoc = existingSnapshot.docs[0];
      await existingDoc.ref.update({
        ...body,
        urgency,
        updatedAt: now,
      });
      return NextResponse.json({ success: true, leadId: existingDoc.id }, { status: 200 });
    }

    const leadDoc = {
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      budgetMin: body.budgetMin || null,
      budgetMax: body.budgetMax || null,
      timeline: body.timeline || null,
      preferredNeighborhoods: body.preferredNeighborhoods || [],
      propertyTypePreference: body.propertyTypePreference || null,
      bedroomsMin: body.bedroomsMin || null,
      status: 'new',
      urgency,
      conversationTranscript: body.conversationTranscript || [],
      source: 'website_chat',
      sessionId: body.sessionId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('leads').add(leadDoc);
    return NextResponse.json({ success: true, leadId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
