# Active Tasks

## Deferred

- [ ] **4. Dependency vulnerabilities** — `npm audit`: all fixes require breaking major upgrades (Next 14→16, firebase-admin downgrade). Monitor for patch-level fixes.
- [ ] **17. Firestore rules deploy** — Rules created, run `firebase deploy --only firestore:rules` when ready

---

## Completed

### Security Hardening — LOW Priority (all 8 fixed)
- [x] **10. Email validation** — `isValidEmail()` check before Resend send in `leadNotification.ts` + leads route
- [x] **11. sessionId validation** — Max 128 chars, string type check in `chat/route.ts` + `leads/route.ts`
- [x] **12. Listings rate limiting** — 30 req/min rate limit added to `listings/route.ts`
- [x] **13. Query param validation** — Status, urgency, date, page, limit validated in `dashboard/leads/route.ts`
- [x] **14. Unsubscribe link** — mailto unsubscribe footer added to all 4 lead-facing email templates
- [x] **15. SITE_URL default** — Changed from `localhost:3000` to `https://skyline-reality.vercel.app` in all 5 templates
- [x] **16. Transcript size limit** — Capped at 100 messages in `leads/route.ts`

### Security Hardening — MEDIUM Priority (8 of 9, committed `a89be79`)
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
