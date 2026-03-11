/**
 * @jest-environment node
 */

const mockHandleToolCalls = jest.fn();
const mockHandleStatusUpdate = jest.fn();
const mockHandleEndOfCall = jest.fn();

jest.mock('@/lib/voice/handleToolCalls', () => ({
  handleToolCalls: (...args: unknown[]) => mockHandleToolCalls(...args),
}));

jest.mock('@/lib/voice/handleStatusUpdate', () => ({
  handleStatusUpdate: (...args: unknown[]) => mockHandleStatusUpdate(...args),
}));

jest.mock('@/lib/voice/handleEndOfCall', () => ({
  handleEndOfCall: (...args: unknown[]) => mockHandleEndOfCall(...args),
}));

jest.mock('@/lib/auth', () => ({
  timingSafeCompare: (a: string, b: string) => a === b,
}));

import { POST } from '@/app/api/vapi/webhook/route';
import { NextRequest } from 'next/server';

function createRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
) {
  return new NextRequest('http://localhost:3000/api/vapi/webhook', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.VAPI_WEBHOOK_SECRET = 'test-secret';
});

describe('POST /api/vapi/webhook', () => {
  it('returns 401 if webhook validation fails', async () => {
    process.env.VAPI_WEBHOOK_SECRET = 'my-secret';
    const req = createRequest(
      { type: 'status-update' },
      { 'x-vapi-secret': 'wrong-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('passes validation when secret matches', async () => {
    process.env.VAPI_WEBHOOK_SECRET = 'my-secret';
    mockHandleStatusUpdate.mockResolvedValue(undefined);
    const req = createRequest(
      { type: 'status-update', status: 'in-progress', call: { id: 'c1' }, timestamp: '' },
      { 'x-vapi-secret': 'my-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 401 when secret is not configured', async () => {
    delete process.env.VAPI_WEBHOOK_SECRET;
    const req = createRequest(
      { type: 'status-update' },
      { 'x-vapi-secret': 'anything' }
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('handles tool-calls event and returns results', async () => {
    mockHandleToolCalls.mockResolvedValue({
      results: [{ toolCallId: 'tc-1', result: 'done' }],
    });
    const req = createRequest(
      {
        type: 'tool-calls',
        call: { id: 'c1' },
        toolCallList: [{ id: 'tc-1', type: 'function', function: { name: 'test', arguments: '{}' } }],
      },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.results).toHaveLength(1);
    expect(mockHandleToolCalls).toHaveBeenCalled();
  });

  it('handles status-update event', async () => {
    mockHandleStatusUpdate.mockResolvedValue(undefined);
    const req = createRequest(
      {
        type: 'status-update',
        status: 'in-progress',
        call: { id: 'c1' },
        timestamp: '2026-03-08T10:00:00Z',
      },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockHandleStatusUpdate).toHaveBeenCalled();
  });

  it('handles end-of-call-report event', async () => {
    mockHandleEndOfCall.mockResolvedValue(undefined);
    const req = createRequest(
      {
        type: 'end-of-call-report',
        call: { id: 'c1', startedAt: '2026-03-08T10:00:00Z', endedAt: '2026-03-08T10:05:00Z' },
        transcript: 'Hello',
        messages: [],
      },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockHandleEndOfCall).toHaveBeenCalled();
  });

  it('returns 200 for informational events', async () => {
    const req = createRequest(
      { type: 'conversation-update' },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });

  it('returns 200 for unknown event types', async () => {
    const req = createRequest(
      { type: 'some-future-event' },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 500 on processing error', async () => {
    mockHandleToolCalls.mockRejectedValue(new Error('boom'));
    const req = createRequest(
      {
        type: 'tool-calls',
        call: { id: 'c1' },
        toolCallList: [{ id: 'tc-1', type: 'function', function: { name: 'test', arguments: '{}' } }],
      },
      { 'x-vapi-secret': 'test-secret' }
    );
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
