import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Timing-safe string comparison to prevent timing attacks on secrets.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Burn the same amount of time to avoid leaking length info
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Authenticate a request using a Bearer token compared against an env var.
 * Returns false if the env var is missing (fail-secure).
 */
export function authenticateBearer(request: NextRequest, envVar: string): boolean {
  const secret = process.env[envVar];
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  return timingSafeCompare(authHeader.slice(7), secret);
}
