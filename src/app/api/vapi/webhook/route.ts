import { NextRequest, NextResponse } from 'next/server';
import type {
  VapiWebhookEvent,
  VapiToolCallEvent,
  VapiStatusUpdateEvent,
  VapiEndOfCallReportEvent,
} from '@/types/voice';

function validateWebhook(request: NextRequest): boolean {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) return true; // Validation optional if secret not configured

  const signature = request.headers.get('x-vapi-secret');
  return signature === secret;
}

export async function POST(request: NextRequest) {
  if (!validateWebhook(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event: VapiWebhookEvent = await request.json();

    switch (event.type) {
      case 'tool-calls': {
        const { handleToolCalls } = await import('@/lib/voice/handleToolCalls');
        const response = await handleToolCalls(
          (event as VapiToolCallEvent).toolCallList
        );
        return NextResponse.json(response, { status: 200 });
      }

      case 'status-update': {
        const { handleStatusUpdate } = await import('@/lib/voice/handleStatusUpdate');
        await handleStatusUpdate(event as VapiStatusUpdateEvent);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case 'end-of-call-report': {
        const { handleEndOfCall } = await import('@/lib/voice/handleEndOfCall');
        await handleEndOfCall(event as VapiEndOfCallReportEvent);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      case 'conversation-update':
      case 'hang':
      case 'user-interrupted':
        return NextResponse.json({ received: true }, { status: 200 });

      default:
        console.warn('[Vapi Webhook] Unknown event type:', event.type);
        return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    console.error('[Vapi Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
