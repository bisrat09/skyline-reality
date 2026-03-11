/**
 * @jest-environment node
 */
import { checkRateLimit, getClientIp, resetStore } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

afterEach(() => {
  resetStore('test');
});

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const result = checkRateLimit('test', '127.0.0.1', {
      windowMs: 60000,
      maxRequests: 3,
    });
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('blocks requests at the limit', () => {
    const config = { windowMs: 60000, maxRequests: 2 };
    checkRateLimit('test', '127.0.0.1', config);
    checkRateLimit('test', '127.0.0.1', config);
    const result = checkRateLimit('test', '127.0.0.1', config);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('allows requests after window expires', () => {
    const config = { windowMs: 1, maxRequests: 1 };
    checkRateLimit('test', '127.0.0.1', config);

    // Wait for the window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit('test', '127.0.0.1', config);
        expect(result.allowed).toBe(true);
        resolve();
      }, 10);
    });
  });

  it('tracks different keys independently', () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    checkRateLimit('test', '1.1.1.1', config);
    const result = checkRateLimit('test', '2.2.2.2', config);
    expect(result.allowed).toBe(true);
  });

  it('tracks different stores independently', () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    checkRateLimit('chat', '1.1.1.1', config);
    const result = checkRateLimit('leads', '1.1.1.1', config);
    expect(result.allowed).toBe(true);
    resetStore('chat');
    resetStore('leads');
  });
});

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-real-ip': '9.8.7.6' },
    });
    expect(getClientIp(req)).toBe('9.8.7.6');
  });

  it('returns unknown when no IP headers', () => {
    const req = new NextRequest('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('resetStore', () => {
  it('clears the store so requests are allowed again', () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    checkRateLimit('test', '1.1.1.1', config);
    expect(checkRateLimit('test', '1.1.1.1', config).allowed).toBe(false);
    resetStore('test');
    expect(checkRateLimit('test', '1.1.1.1', config).allowed).toBe(true);
  });
});
