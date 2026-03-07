import { NextRequest, NextResponse } from 'next/server';
import type { ChatRequest } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { success: false, error: 'Each message must have role and content' },
          { status: 400 }
        );
      }
    }

    const { anthropic } = await import('@/lib/anthropic');
    const { buildSystemPrompt } = await import('@/prompts/systemPrompt');

    // Fetch active listings for context
    let listings: import('@/types/listing').PropertyListing[] = [];
    try {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snapshot = await adminDb
        .collection('listings')
        .where('status', '==', 'active')
        .get();
      listings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as import('@/types/listing').PropertyListing));
    } catch {
      // Continue without listings context if Firestore fails
      console.warn('Failed to fetch listings for chat context');
    }

    const systemPrompt = buildSystemPrompt(listings);

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({
                type: 'text_delta',
                text: event.delta.text,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          const stopData = JSON.stringify({ type: 'message_stop' });
          controller.enqueue(encoder.encode(`data: ${stopData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Stream interrupted',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
