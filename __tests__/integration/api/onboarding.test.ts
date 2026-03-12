/**
 * @jest-environment node
 */
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

const mockCreateAgent = jest.fn();
const mockGetAgentById = jest.fn();

jest.mock('@/lib/firestore/agents', () => ({
  createAgent: (...args: unknown[]) => mockCreateAgent(...args),
  getAgentById: (...args: unknown[]) => mockGetAgentById(...args),
}));

import { POST, GET } from '@/app/api/onboarding/route';
import { NextRequest } from 'next/server';

function makePostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/onboarding');
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, { method: 'GET' });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/onboarding', () => {
  it('creates an agent with valid data', async () => {
    mockCreateAgent.mockResolvedValue('agent-123');

    const res = await POST(makePostRequest({
      name: 'Sarah Chen',
      brokerage: 'Compass',
      phone: '2065551234',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.agentId).toBe('agent-123');
  });

  it('rejects missing name', async () => {
    const res = await POST(makePostRequest({
      brokerage: 'Compass',
      phone: '2065551234',
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Name');
  });

  it('rejects invalid phone', async () => {
    const res = await POST(makePostRequest({
      name: 'Sarah Chen',
      brokerage: 'Compass',
      phone: '123',
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('phone');
  });

  it('rejects missing brokerage', async () => {
    const res = await POST(makePostRequest({
      name: 'Sarah Chen',
      phone: '2065551234',
    }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Brokerage');
  });
});

describe('GET /api/onboarding', () => {
  it('returns agent by ID', async () => {
    mockGetAgentById.mockResolvedValue({
      id: 'agent-123',
      name: 'Sarah Chen',
      brokerage: 'Compass',
    });

    const res = await GET(makeGetRequest({ id: 'agent-123' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.agent.name).toBe('Sarah Chen');
  });

  it('returns 404 for unknown agent', async () => {
    mockGetAgentById.mockResolvedValue(null);

    const res = await GET(makeGetRequest({ id: 'nonexistent' }));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('returns 400 without ID', async () => {
    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('ID');
  });
});
