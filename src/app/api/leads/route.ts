import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
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

async function triggerLeadNotifications(params: {
  leadId: string;
  body: CreateLeadRequest;
  urgency: LeadUrgency;
  now: string;
}) {
  const { adminDb } = await import('@/lib/firebase/admin');

  // Send instant emails (agent notification + lead welcome)
  try {
    const { notifyNewLead } = await import('@/lib/email/leadNotification');
    const results = await notifyNewLead({
      leadId: params.leadId,
      name: params.body.name || null,
      email: params.body.email || null,
      phone: params.body.phone || null,
      urgency: params.urgency,
      budgetMin: params.body.budgetMin || null,
      budgetMax: params.body.budgetMax || null,
      timeline: params.body.timeline || null,
      preferredNeighborhoods: params.body.preferredNeighborhoods || [],
      bedroomsMin: params.body.bedroomsMin || null,
      propertyTypePreference: params.body.propertyTypePreference || null,
      conversationTranscript: params.body.conversationTranscript || [],
    });

    await adminDb.collection('leads').doc(params.leadId).update({
      agentNotificationSent: results.agentNotification.success,
      welcomeEmailSent: results.leadWelcome.success,
    });
  } catch (err) {
    console.error('Instant email error:', err);
  }

  // Schedule follow-up sequence (Day 1, 3, 7)
  try {
    if (params.body.email) {
      const { scheduleFollowUps } = await import('@/lib/firestore/followUps');
      await scheduleFollowUps({
        leadId: params.leadId,
        leadEmail: params.body.email,
        leadName: params.body.name || null,
        createdAt: params.now,
      });

      await adminDb.collection('leads').doc(params.leadId).update({
        followUpScheduled: true,
      });
    }
  } catch (err) {
    console.error('Follow-up scheduling error:', err);
  }
}

export async function POST(request: NextRequest) {
  const { allowed } = checkRateLimit('leads', getClientIp(request), {
    windowMs: 60_000,
    maxRequests: 5,
  });
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429 }
    );
  }

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
        name: body.name || null,
        email: body.email || null,
        phone: body.phone || null,
        budgetMin: body.budgetMin || null,
        budgetMax: body.budgetMax || null,
        timeline: body.timeline || null,
        preferredNeighborhoods: body.preferredNeighborhoods || [],
        propertyTypePreference: body.propertyTypePreference || null,
        bedroomsMin: body.bedroomsMin || null,
        conversationTranscript: body.conversationTranscript || [],
        sessionId: body.sessionId,
        urgency,
        updatedAt: now,
      });
      return NextResponse.json(
        { success: true, leadId: existingDoc.id, isNewLead: false },
        { status: 200 }
      );
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
      followUpScheduled: false,
      welcomeEmailSent: false,
      agentNotificationSent: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('leads').add(leadDoc);

    // Fire-and-forget: send instant emails + schedule follow-ups
    triggerLeadNotifications({
      leadId: docRef.id,
      body,
      urgency,
      now,
    }).catch((err) => console.error('Lead notification error:', err));

    return NextResponse.json(
      { success: true, leadId: docRef.id, isNewLead: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
