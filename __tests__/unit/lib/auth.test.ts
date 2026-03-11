/**
 * @jest-environment node
 */
import { timingSafeCompare, authenticateBearer } from '@/lib/auth';
import { NextRequest } from 'next/server';

describe('timingSafeCompare', () => {
  it('returns true for equal strings', () => {
    expect(timingSafeCompare('secret123', 'secret123')).toBe(true);
  });

  it('returns false for different strings of same length', () => {
    expect(timingSafeCompare('secret123', 'secret456')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(timingSafeCompare('short', 'much-longer-string')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(timingSafeCompare('', '')).toBe(true);
  });

  it('returns false when one is empty', () => {
    expect(timingSafeCompare('', 'notempty')).toBe(false);
  });
});

describe('authenticateBearer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createRequest(authHeader?: string): NextRequest {
    const headers: Record<string, string> = {};
    if (authHeader) headers['authorization'] = authHeader;
    return new NextRequest('http://localhost/api/test', { headers });
  }

  it('returns true with valid Bearer token', () => {
    process.env.TEST_SECRET = 'my-secret';
    const req = createRequest('Bearer my-secret');
    expect(authenticateBearer(req, 'TEST_SECRET')).toBe(true);
  });

  it('returns false with wrong token', () => {
    process.env.TEST_SECRET = 'my-secret';
    const req = createRequest('Bearer wrong-secret');
    expect(authenticateBearer(req, 'TEST_SECRET')).toBe(false);
  });

  it('returns false when env var is missing', () => {
    delete process.env.TEST_SECRET;
    const req = createRequest('Bearer anything');
    expect(authenticateBearer(req, 'TEST_SECRET')).toBe(false);
  });

  it('returns false when no authorization header', () => {
    process.env.TEST_SECRET = 'my-secret';
    const req = createRequest();
    expect(authenticateBearer(req, 'TEST_SECRET')).toBe(false);
  });

  it('returns false for non-Bearer auth scheme', () => {
    process.env.TEST_SECRET = 'my-secret';
    const req = createRequest('Basic my-secret');
    expect(authenticateBearer(req, 'TEST_SECRET')).toBe(false);
  });
});
