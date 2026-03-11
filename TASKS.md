# Active Tasks

## Current: Security Hardening — MEDIUM & LOW Priority Fixes

### MEDIUM Priority — 8 of 9 FIXED (see #4 below)

- [x] **1. Security headers** — CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy added to `next.config.mjs`
- [x] **2. Disable X-Powered-By** — `poweredByHeader: false` in `next.config.mjs`
- [x] **3. Dashboard auth** — Server-side validation before storing auth state (`useDashboardAuth.ts`)
- [ ] **4. Dependency vulnerabilities** — `npm audit`: all fixes require breaking major upgrades (Next 14→16, firebase-admin downgrade). Monitor for patch-level fixes.
- [x] **5. Rate limiter cleanup** — Added `pruneExpired()` to prevent memory leaks (`rateLimit.ts`)
- [x] **6. IP spoofing** — Now prefers `x-real-ip`, falls back to rightmost `x-forwarded-for` (`rateLimit.ts`)
- [x] **7. Numeric param validation** — limit (1-100), price, bedrooms validated in `listings/route.ts`
- [x] **8. Cron rate limiting** — 2 req/min limit added to `cron/follow-ups/route.ts`
- [x] **9. Error logging** — All API routes now log `error.message` only, not full objects

### LOW Priority

- [ ] **10. Email validation** — No email format validation before sending via Resend (`leadNotification.ts`)
- [ ] **11. sessionId validation** — No length/format validation (`chat/route.ts`, `leads/route.ts`)
- [ ] **12. Listings rate limiting** — Listings API has no rate limiting (`listings/route.ts`)
- [ ] **13. Query param validation** — Dashboard status/urgency params not validated (`dashboard/leads/route.ts`)
- [ ] **14. Unsubscribe link** — No unsubscribe in follow-up emails; CAN-SPAM compliance (email templates)
- [ ] **15. SITE_URL default** — Defaults to `http://localhost:3000` in email templates
- [ ] **16. Transcript size limit** — `conversationTranscript` stored without size limits (`leads/route.ts`)
- [ ] **17. Firestore rules deploy** — Rules created but may not be deployed yet

---

## Completed

### Security Hardening — MEDIUM Priority (committed latest)
- [x] Security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] X-Powered-By disabled
- [x] Dashboard auth server-side validation
- [x] Rate limiter cleanup + IP spoofing fix
- [x] Numeric param validation in listings API
- [x] Cron rate limiting
- [x] Error logging sanitized across all routes

### Security Hardening — CRITICAL & HIGH (committed `89d8289`)
- [x] Firestore security rules created
- [x] HTML injection fixed in all 6 email templates
- [x] Rate limiting on chat (10/min), leads (5/min), dashboard (10/15min)
- [x] Timing-safe auth on all 5 protected routes
- [x] Vapi webhook fail-secure
- [x] Field allowlist in leads API
- [x] Role validation + message limits in chat API
- [x] Client SDK writes removed from leads.ts
- [x] Stale closure fixed in useChat.ts
- [x] Batch limit on getPendingFollowUps
- [x] Listings API switched to admin SDK
- [x] Listing ID mismatch fixed in ChatMessage
