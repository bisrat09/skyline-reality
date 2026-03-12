/**
 * @jest-environment node
 */
jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
}));

import { POST } from '@/app/api/dashboard/login/route';
import { checkRateLimit } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

const mockCheckRateLimit = checkRateLimit as jest.Mock;

function createRequest(headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/dashboard/login', {
    method: 'POST',
    headers,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.DASHBOARD_PASSWORD = 'test-pass';
  mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfterMs: 0 });
});

afterEach(() => {
  delete process.env.DASHBOARD_PASSWORD;
});

describe('POST /api/dashboard/login', () => {
  it('returns 200 with correct password', async () => {
    const res = await POST(createRequest({ authorization: 'Bearer test-pass' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('returns 401 with invalid password', async () => {
    const res = await POST(createRequest({ authorization: 'Bearer wrong' }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Invalid password');
  });

  it('returns 401 without auth header', async () => {
    const res = await POST(createRequest());
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfterMs: 60000 });
    const res = await POST(createRequest({ authorization: 'Bearer test-pass' }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Too many login attempts');
  });

  it('uses separate dashboard-login rate limit bucket', async () => {
    await POST(createRequest({ authorization: 'Bearer test-pass' }));
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      'dashboard-login',
      expect.any(String),
      expect.any(Object)
    );
  });
});
