import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/** Prune expired entries from a store to prevent memory leaks. */
function pruneExpired(store: Map<string, RateLimitEntry>): void {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  });
}

export function checkRateLimit(
  storeName: string,
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterMs: number } {
  if (!stores.has(storeName)) stores.set(storeName, new Map());
  const store = stores.get(storeName)!;

  // Periodically prune expired entries (every 100 checks)
  if (store.size > 100) {
    pruneExpired(store);
  }

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Extract client IP from request headers.
 * On Vercel, x-real-ip is set by the infrastructure and is trustworthy.
 * For x-forwarded-for, use the rightmost IP (appended by infrastructure),
 * not the leftmost (which the client controls).
 */
export function getClientIp(request: NextRequest): string {
  // Prefer x-real-ip — set by Vercel/infrastructure, not spoofable
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback: rightmost x-forwarded-for entry (added by infrastructure)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[ips.length - 1];
  }

  return 'unknown';
}

/** Reset a rate limit store (for testing). */
export function resetStore(storeName: string): void {
  stores.delete(storeName);
}
