/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

// Mock anthropic
const mockStream = {
  [Symbol.asyncIterator]: jest.fn().mockReturnValue({
    next: jest.fn()
      .mockResolvedValueOnce({
        value: {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello! ' },
        },
        done: false,
      })
      .mockResolvedValueOnce({
        value: {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'How can I help?' },
        },
        done: false,
      })
      .mockResolvedValueOnce({ done: true }),
  }),
};

jest.mock('@/lib/anthropic', () => ({
  anthropic: {
    messages: {
      stream: jest.fn().mockReturnValue(mockStream),
    },
  },
}));

jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      }),
    }),
  },
}));

function createRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the async iterator
    mockStream[Symbol.asyncIterator] = jest.fn().mockReturnValue({
      next: jest.fn()
        .mockResolvedValueOnce({
          value: {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: 'Hello!' },
          },
          done: false,
        })
        .mockResolvedValueOnce({ done: true }),
    });
  });

  it('returns SSE stream', async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Hi' }],
        sessionId: 'session-1',
      })
    );
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('streams text deltas', async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Hi' }],
        sessionId: 'session-1',
      })
    );
    const text = await res.text();
    expect(text).toContain('text_delta');
    expect(text).toContain('Hello!');
  });

  it('includes message_stop event', async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Hi' }],
        sessionId: 'session-1',
      })
    );
    const text = await res.text();
    expect(text).toContain('message_stop');
  });

  it('returns 400 for empty messages array', async () => {
    const res = await POST(
      createRequest({ messages: [], sessionId: 's1' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing sessionId', async () => {
    const res = await POST(
      createRequest({ messages: [{ role: 'user', content: 'Hi' }] })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid message format', async () => {
    const res = await POST(
      createRequest({
        messages: [{ role: 'user' }],
        sessionId: 's1',
      })
    );
    expect(res.status).toBe(400);
  });

  it('calls Claude with system prompt', async () => {
    const { anthropic } = require('@/lib/anthropic');
    await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Hi' }],
        sessionId: 'session-1',
      })
    );
    // Read the stream to trigger the async iteration
    const res = await POST(
      createRequest({
        messages: [{ role: 'user', content: 'Hi' }],
        sessionId: 'session-1',
      })
    );
    await res.text();
    expect(anthropic.messages.stream).toHaveBeenCalled();
    const callArgs = anthropic.messages.stream.mock.calls[0][0];
    expect(callArgs.system).toBeDefined();
    expect(callArgs.model).toBe('claude-sonnet-4-20250514');
  });
});
