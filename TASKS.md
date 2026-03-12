# Active Tasks

---

## Completed

### Agent Onboarding Flow — COMPLETE
- [x] **ONB-1. Types + Firestore layer** — `src/types/agent.ts` (AgentConfig, AgentListing, OnboardingStep), `src/lib/firestore/agents.ts` (createAgent, getAgentById, updateAgent)
- [x] **ONB-2. API routes** — `POST /api/onboarding` (create agent), `GET /api/onboarding?id=` (retrieve), `PATCH /api/onboarding/[id]` (update). Rate limited, validated, field-allowlisted.
- [x] **ONB-3. useOnboarding hook** — Multi-step form state, per-step validation, session resume via sessionStorage, Firestore persistence on each step transition
- [x] **ONB-4. Onboarding UI components** — StepIndicator, ProfileStep, GreetingStep, ListingFormCard, ListingsStep, CalendarStep, PreviewStep, OnboardingLayout (8 components)
- [x] **ONB-5. Onboarding page** — `/onboarding` page wired up
- [x] **ONB-6. Tests + build** — 646 tests passing across 79 test files (38 new tests). Build clean.

## Deferred

- [ ] **4. Dependency vulnerabilities** — `npm audit`: all fixes require breaking major upgrades (Next 14→16, firebase-admin downgrade). Monitor for patch-level fixes.
- [ ] **17. Firestore rules deploy** — Rules created, run `firebase deploy --only firestore:rules` when ready
- [ ] **QA-6. Dashboard auth storage** — Password in `sessionStorage`. Moving to HttpOnly cookies requires session layer, CSRF protection, and cookie-setting across all API routes — too invasive for a hardening pass. Risk is low: sessionStorage is per-tab, cleared on close, and CSP mitigates XSS.

---

## Completed

### QA Hardening Pass (Codex-identified defects, committed `d48fb4c`)
- [x] **QA-1. Same-session lead enrichment** — Replaced `submittedRef` gate with fingerprint comparison. Visitors can now share email first, then add phone/budget later — same lead record gets updated via sessionId upsert.
- [x] **QA-2. False-positive name extraction** — Added blocklist of ~50 common non-name words (looking, tomorrow, interested, etc.) to name regex. "I'm looking for a 3 bedroom" and "call me tomorrow" no longer pollute lead names.
- [x] **QA-3. Voice end-of-call idempotency** — `handleEndOfCall` now checks `existing.leadId` before calling `createLeadFromVoiceCall`. Replayed webhooks update the voice call but skip duplicate lead creation. `createLeadFromVoiceCall` now persists `agentNotificationSent` on the lead doc.
- [x] **QA-4. Dashboard login/rate-limit coupling** — Created dedicated `POST /api/dashboard/login` with its own `dashboard-login` rate-limit bucket. `useDashboardAuth.login()` now returns `{ success, error }` with typed errors: `invalid_password`, `rate_limited`, `network_error`. Dashboard page shows distinct messages for each.
- [x] **QA-5. Voice dashboard data integrity** — Moved date filtering from client-side to Firestore `.where()` queries in `getAllVoiceCalls()`, applied before `.limit()` for complete results. Notification status persistence was fixed as part of QA-3.
- [x] **QA-7. Google Fonts build dependency** — Removed `next/font/google` from `layout.tsx`. Switched to system font stack (`Inter, system-ui, -apple-system, sans-serif`) in Tailwind config and globals.css. Build succeeds offline.
- [x] **QA-8. Voice Calls tab unauthorized recovery** — `useVoiceCalls` now accepts `onUnauthorized` callback (like `useDashboard`). Dashboard page passes `auth.handleUnauthorized` so 401 on voice calls triggers login redirect instead of a broken page.

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
