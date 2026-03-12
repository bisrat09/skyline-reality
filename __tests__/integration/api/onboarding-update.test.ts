/**
 * @jest-environment node
 */
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

const mockUpdateAgent = jest.fn();
const mockGetAgentById = jest.fn();

jest.mock('@/lib/firestore/agents', () => ({
  updateAgent: (...args: unknown[]) => mockUpdateAgent(...args),
  getAgentById: (...args: unknown[]) => mockGetAgentById(...args),
}));

import { PATCH } from '@/app/api/onboarding/[id]/route';
import { NextRequest } from 'next/server';

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/onboarding/agent-123', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAgentById.mockResolvedValue({ id: 'agent-123', name: 'Sarah' });
  mockUpdateAgent.mockResolvedValue(undefined);
});

describe('PATCH /api/onboarding/[id]', () => {
  it('updates chatGreeting', async () => {
    const res = await PATCH(makeRequest({ chatGreeting: 'Welcome!' }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateAgent).toHaveBeenCalledWith('agent-123', { chatGreeting: 'Welcome!' });
  });

  it('updates listings with valid data', async () => {
    const listings = [
      { id: '1', name: 'Condo', address: '123 Main St', price: 500000, bedrooms: 2, bathrooms: 1 },
    ];

    const res = await PATCH(makeRequest({ listings }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects invalid listing (missing name)', async () => {
    const listings = [
      { id: '1', name: '', address: '123 Main', price: 500000, bedrooms: 2, bathrooms: 1 },
    ];

    const res = await PATCH(makeRequest({ listings }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('listing');
  });

  it('rejects empty body', async () => {
    const res = await PATCH(makeRequest({ unknownField: 'test' }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('No valid fields');
  });

  it('returns 404 for nonexistent agent', async () => {
    mockGetAgentById.mockResolvedValue(null);

    const res = await PATCH(makeRequest({ chatGreeting: 'Hi' }), {
      params: { id: 'nonexistent' },
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('updates calLink', async () => {
    const res = await PATCH(makeRequest({ calLink: 'https://cal.com/sarah/showing' }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('rejects greeting over 500 chars', async () => {
    const res = await PATCH(makeRequest({ chatGreeting: 'x'.repeat(501) }), {
      params: { id: 'agent-123' },
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('500');
  });
});
