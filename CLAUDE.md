# Skyline Realty AI Demo

## Working Protocol
- Always read TASKS.md before starting work
- Update TASKS.md after every completed item
- If TASKS.md has pending items, continue those first
- Never re-scan if a scan's results are already in TASKS.md

## Project Overview

This is a demo/portfolio project showcasing an AI-powered lead capture and follow-up system for real estate agencies. The goal is to use this demo to sell AI consulting services to real estate agents at $2,500-4,000 per implementation, with $500-1,000/month retainers.

## Target Client

- Solo real estate agents and small brokerages (2-5 agents)
- Pain point: slow lead response times, repetitive property questions, leads falling through the cracks
- Value prop: "Every lead gets a response in under 60 seconds, 24/7"

## What We're Building

### Phase 1: Landing Page + AI Chatbot (BUILD THIS FIRST)

- Professional landing page for a fictional agency called "Skyline Realty"
- AI chatbot embedded on the page that:
  - Answers common property/buying/selling questions
  - Captures lead info: name, email, phone, budget range, timeline, preferred neighborhoods
  - Suggests available properties from a sample listings database
  - Books showings on a calendar (integrate with Cal.com or Calendly)
  - The chatbot should feel conversational and helpful, not robotic

### Phase 2: Automated Lead Follow-Up

- When a new lead is captured, automatically send a personalized SMS/email within 60 seconds
- Lead summary sent to the agent with urgency level (hot/warm/cold)
- Follow-up sequence: Day 1, Day 3, Day 7 touchpoints

### Phase 3: Lead Dashboard

Simple admin page showing:
- New leads with contact info and conversation transcripts
- Lead status (new, contacted, showing booked, closed)
- Basic analytics (leads this week, response times, conversion rate)

### Phase 4 (Future): Voice AI Agent

- AI phone agent that answers after-hours calls
- Qualifies callers and books appointments
- Sends agent a summary with urgency level

## Tech Stack

- **Frontend:** React or Next.js, Tailwind CSS
- **AI/Chatbot:** Claude API (Anthropic) or OpenAI API
- **Automation:** n8n (self-hosted) or Make.com for workflows
- **Calendar:** Cal.com or Calendly integration
- **Database:** PostgreSQL or Supabase for leads and listings
- **Deployment:** Vercel for frontend, Railway or VPS for backend
- **Voice AI (Phase 4):** LiveKit or Vapi

## Sample Data

Use 10-15 fictional property listings in the Seattle, WA area with realistic details:

- Address, price, bedrooms, bathrooms, sqft
- Property type (single family, condo, townhouse)
- Key features and neighborhood highlights
- Listing status (active, pending, sold)

Use real Seattle neighborhoods: Capitol Hill, Ballard, Fremont, Queen Anne, Wallingford, Green Lake, Beacon Hill, Columbia City, West Seattle, Magnolia, Ravenna, University District

Price ranges should reflect actual Seattle market ($450K-1.5M+ depending on area and type)

Highlight Seattle-specific features: mountain views, water views, walkability scores, proximity to light rail, tech company commute times

## Design Guidelines

- Clean, modern, professional look — this needs to impress real estate agents
- Mobile-responsive (agents will view the demo on their phones)
- Color scheme: navy blue + white + gold accents (conveys trust and luxury)
- The chatbot widget should be prominent but not intrusive

## Key Selling Points to Demonstrate

1. Instant lead response (under 60 seconds, 24/7)
2. Intelligent qualification (budget, timeline, preferences)
3. Automatic appointment booking
4. No leads fall through the cracks
5. Agent gets a summary without doing any work

## Developer Notes

- Keep the codebase clean and modular — this will be replicated across multiple clients
- Build reusable components that can be reskinned for different agencies
- Document API integrations so setup for new clients takes hours, not days
- Prioritize mobile experience — most leads come from phones

---

## Tech Stack (Finalized)

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3 with custom navy/gold theme
- **AI/Chatbot:** Claude API via `@anthropic-ai/sdk`
- **Database:** Firestore (Firebase client + admin SDKs)
- **Calendar:** Cal.com (`@calcom/embed-react`)
- **Testing:** Jest + React Testing Library (unit/integration), Playwright (E2E)
- **Utilities:** clsx + tailwind-merge for class merging
- **Deployment:** Vercel (target)

## Phase 1 Progress

### Completed (Steps 1-10 of 10) — PHASE 1 COMPLETE

#### Step 1: Project Scaffolding
- Next.js 14 with App Router, TypeScript, Tailwind CSS
- Jest + RTL + Playwright configs
- Mock files for `@anthropic-ai/sdk`, `firebase`, `firebase-admin`, `@calcom/embed-react`
- `.env.example`, `.gitignore`, `tsconfig.json`, `tailwind.config.ts`

#### Step 2: Types + Utilities
- **Types:** `src/types/` — `listing.ts`, `lead.ts`, `chat.ts`, `api.ts`
- **Utilities:** `src/lib/utils/` — `cn.ts` (class merge), `formatCurrency.ts`, `formatDate.ts`, `validators.ts`
- **Tests:** 29 tests passing

#### Step 3: UI Component Library
- **Components:** `src/components/ui/` — Button, Badge, Card, Input, Logo, Container, SectionHeading, Spinner
- All support variants, sizes, and custom className merging
- **Tests:** 47 tests passing

#### Step 4: Firebase + Data Layer
- **Firebase:** `src/lib/firebase/client.ts` (client SDK), `src/lib/firebase/admin.ts` (admin SDK)
- **Anthropic:** `src/lib/anthropic.ts` (Claude API client)
- **Firestore CRUD:** `src/lib/firestore/listings.ts`, `src/lib/firestore/leads.ts`
- **Seed Data:** `src/data/seedListings.ts` — 15 Seattle properties across 12 neighborhoods
- **Seed Script:** `src/scripts/seed.ts` — run via `npm run seed`
- **Tests:** 30 tests passing

#### Step 5: API Routes (partially complete)
- `GET /api/listings` — filtered queries with caching headers
- `POST /api/leads` — lead creation/upsert with urgency calculation (hot/warm/cold)
- `POST /api/chat` — Claude streaming via SSE with system prompt + listings context
- **System Prompt:** `src/prompts/systemPrompt.ts` — includes listings context, lead capture instructions, property suggestion markers
- **Tests:** 27 integration tests passing

#### Step 6: Landing Page Sections
- **Layout:** `src/components/layout/` — Navbar (sticky, scroll-aware), Footer, MobileMenu
- **Sections:** `src/components/sections/` — Hero, FeaturedListings, Services, Stats, Testimonials, CTA
- **Listings:** `src/components/listings/` — PropertyCard, PropertyGrid, PropertyBadge
- **Page:** `src/app/page.tsx` — wired up with all sections + ChatWidget
- **Tests:** 69 new tests (202 total)

#### Step 7: Chat System
- **Hook:** `src/hooks/useChat.ts` — SSE streaming, marker extraction (`extractMarkers`, `stripMarkers`)
- **Chat UI:** `src/components/chat/` — ChatWidget (forwardRef), ChatPanel, ChatMessage, ChatInput, ChatHeader, ChatTypingIndicator
- **Markers:** `[SUGGEST_PROPERTY:id]` renders inline PropertyCard, `[BOOK_SHOWING:id]` renders BookingPrompt
- **Tests:** 39 new tests (241 total)

#### Step 8: Lead Capture System
- **Hook:** `src/hooks/useLeadCapture.ts` — regex extraction for email, phone, budget, bedrooms, neighborhoods, name, timeline, property type
- **Functions:** `extractLeadFields`, `mergeFields`, `hasReachedThreshold` (pure, exported)
- **Integration:** ChatPanel auto-submits to `/api/leads` when threshold met (contact info + 1 more field)
- **Tests:** 38 new tests (279 total)

#### Step 9: Cal.com Integration
- **Components:** `src/components/booking/` — CalEmbed (wrapper), BookingPrompt (expandable card)
- **Page:** `src/app/booking/page.tsx` — standalone booking page
- **Integration:** ChatMessage renders BookingPrompt for `[BOOK_SHOWING:id]` markers
- **Tests:** 13 new tests (292 total)

#### Step 10: Polish + E2E Tests
- **SEO:** Enhanced metadata (keywords, Twitter card, OpenGraph, robots)
- **Mobile:** Responsive chat panel, mobile menu, stacking property grid
- **E2E:** 4 Playwright test files — landing-page, chat-widget, booking-page, mobile
- **Tests:** 292 unit/integration tests passing across 42 files

### Test Summary (final)
- **292 tests passing** across 42 test files
- Unit: utils (29), UI components (47), lib/firebase/firestore (30), listings (25), sections (28), layout (16), chat (33), booking (13), hooks (48)
- Integration: API routes (27)
- E2E: 4 Playwright spec files (landing-page, chat-widget, booking-page, mobile)

## Key Architecture Decisions

1. **Custom `useChat` hook** — not Vercel AI SDK, for full control over SSE parsing and custom markers
2. **SSE streaming** — token-by-token response for conversational feel
3. **Dual lead extraction** — server-side in `/api/chat` + client-side `useLeadCapture` hook
4. **`forwardRef` on ChatWidget** — Hero/CTA sections can open chat externally
5. **Client-side Firestore reads** for public listings, admin SDK writes for leads

## Firestore Schema

**`listings`** — PropertyListing: id, address, neighborhood, price, bedrooms, bathrooms, sqft, propertyType, status, yearBuilt, description, features[], neighborhoodHighlights[], imageUrl, isFeatured, timestamps

**`leads`** — LeadData: id, name, email, phone, budgetMin/Max, timeline, preferredNeighborhoods[], propertyTypePreference, bedroomsMin, status, urgency (hot/warm/cold), conversationTranscript[], source, sessionId, timestamps

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run all unit + integration tests (589 tests)
npm run test:coverage # Tests with coverage report
npm run test:e2e     # Playwright E2E tests
npm run seed         # Seed Firestore with sample listings
npm run setup:vapi   # Create/update Vapi assistant with tools
```

## Setup Checklist (to get the demo fully working)

### Step 1: Create `.env.local`
```bash
cp .env.example .env.local
```
Fill in these values:
```
ANTHROPIC_API_KEY=sk-ant-...        # From console.anthropic.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### Step 2: Set up Firebase
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate a service account key (Settings > Service accounts > Generate new private key)
4. Copy the values into `.env.local`

### Step 3: Seed the database
```bash
npm run seed
```

### Step 4: Set up Cal.com
1. Create free account at [cal.com](https://cal.com)
2. Create an event type (e.g., "Property Showing", 30 min)
3. Copy your link (e.g., `your-username/property-showing`)
4. Update the default in `src/components/booking/CalEmbed.tsx`:
```tsx
const DEFAULT_CAL_LINK = 'your-username/property-showing';
```

### Step 5: Run it
```bash
npm run dev
```

That's it — the chat responds via Claude, leads get saved to Firestore, and bookings go through Cal.com.

## UI Redesign: Compass-Inspired (Post Phase 1)

Redesigned the homepage from a dark navy theme to a bright, Compass.com-inspired layout.

### Key Changes
- **Hero:** Full-width background property image with subtle dark overlay (`bg-black/40`), white text, centered search bar that opens the AI chat
- **Navbar:** Transparent over hero with white text, transitions to white bg + shadow on scroll (like Compass)
- **Color shift:** Primary accent from gold to compass blue (`#0070F3`), dark sections converted to light
- **New Tailwind colors:** `compass` (blue interactive), `warm` (neutral grays for section alternation)
- **Button:** New `compass` variant added (blue CTA buttons across all sections)
- **Section backgrounds:** Hero (image+overlay) → Properties (white) → Services (white) → Stats (warm-100) → Testimonials (white) → CTA (warm-100) → Footer (gray-50)
- **PropertyCard:** Taller images (h-56), compass-blue neighborhood labels
- **Footer:** Light gray with dark text (was dark navy with white text)
- **Logo:** Navbar size bumped to `text-2xl` for better visibility

### Files Modified (14)
- `tailwind.config.ts`, `src/app/globals.css`
- `src/components/ui/Button.tsx`, `src/components/ui/SectionHeading.tsx`, `src/components/ui/Logo.tsx`
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/MobileMenu.tsx`
- `src/components/sections/Hero.tsx`, `src/components/sections/FeaturedListings.tsx`, `src/components/sections/Services.tsx`, `src/components/sections/Stats.tsx`, `src/components/sections/Testimonials.tsx`, `src/components/sections/CTA.tsx`
- `src/components/listings/PropertyCard.tsx`

### Tests
- **292 tests still passing** across 42 test files (no test changes needed — all tests check text content, not CSS)

## Phase 2: Automated Lead Follow-Up — COMPLETE

Automated email follow-up system: when a lead is captured via the chatbot, instant emails are sent within seconds, and a scheduled Day 1/3/7 follow-up sequence keeps them engaged.

### Architecture
- **Email provider:** Resend (`resend` npm package)
- **Instant emails (fire-and-forget):** Triggered from `POST /api/leads` on NEW lead creation only
  1. Agent notification: urgency badge (HOT/WARM/COLD), lead summary, conversation highlights, "Contact Lead Now" CTA
  2. Lead welcome: personalized greeting, search criteria confirmation, "Browse Listings" CTA
- **Follow-up sequence:** Day 1 (new listings), Day 3 (market insights), Day 7 (re-engagement)
- **Scheduling:** Firestore `follow_ups` collection + Vercel Cron (`GET /api/cron/follow-ups`)
- **Cron job:** Runs daily at 10am (configurable in `vercel.json`), protected by `CRON_SECRET` Bearer auth

### New Files (15)
- `src/types/email.ts` — FollowUp, EmailResult, template data types
- `src/lib/resend.ts` — Resend client singleton
- `src/lib/email/sendEmail.ts` — Email send wrapper with error handling
- `src/lib/email/leadNotification.ts` — Instant notification orchestrator + `extractConversationHighlights()`
- `src/lib/email/templates/agentNotification.ts` — Agent notification HTML template
- `src/lib/email/templates/leadWelcome.ts` — Lead welcome HTML template
- `src/lib/email/templates/followUpDay1.ts` — Day 1 follow-up template
- `src/lib/email/templates/followUpDay3.ts` — Day 3 follow-up template
- `src/lib/email/templates/followUpDay7.ts` — Day 7 follow-up template
- `src/lib/email/templates/index.ts` — Barrel export
- `src/lib/firestore/followUps.ts` — Follow-up CRUD (schedule, getPending, markSent/Failed, cancel)
- `src/app/api/cron/follow-ups/route.ts` — Vercel Cron endpoint
- `vercel.json` — Cron schedule configuration
- `__mocks__/resend.ts` — Jest mock for Resend

### Modified Files (6)
- `src/types/lead.ts` — Added `followUpScheduled`, `welcomeEmailSent`, `agentNotificationSent` booleans
- `src/types/api.ts` — Added `isNewLead` to `CreateLeadResponse`
- `src/app/api/leads/route.ts` — Fire-and-forget email triggering + follow-up scheduling on new lead creation
- `jest.config.ts` — Added `resend` mock mapping
- `.env.example` — Added `RESEND_API_KEY`, `AGENT_EMAIL`, `AGENT_NAME`, `CRON_SECRET`
- `__tests__/unit/components/ui/Logo.test.tsx` — Fixed pre-existing test (text-xl → text-2xl)

### Firestore Schema: `follow_ups` Collection
```
id, leadId, leadEmail, leadName, type (day1|day3|day7),
status (pending|sent|failed|cancelled), scheduledAt, sentAt,
failedAt, failureReason, createdAt, updatedAt
```

### New Environment Variables
```
RESEND_API_KEY=re_xxxxx          # From resend.com
AGENT_EMAIL=agent@example.com    # Real estate agent's email for notifications
AGENT_NAME=Sarah Chen            # Agent name for email personalization
CRON_SECRET=your-secret          # Protects cron endpoint from unauthorized access
```

### Tests
- **376 tests passing** across 49 test files (84 new tests)
- New test files: agentNotification, leadWelcome, followUps (templates), sendEmail, leadNotification, firestore/followUps, cron-follow-ups, updated leads API tests

### Notes
- Resend free tier: sends from `onboarding@resend.dev` (domain verification needed for production)
- Vercel Hobby plan: daily cron only (hourly on Pro plan)
- Firestore composite index needed for `follow_ups` (status + scheduledAt) — auto-generated URL on first query error

## Phase 3: Lead Dashboard — COMPLETE

Admin dashboard at `/dashboard` for real estate agents to view leads, update statuses, and see analytics.

### Architecture
- **Auth:** Env-based `DASHBOARD_PASSWORD` with Bearer token (same pattern as cron endpoint)
- **Client stores password in `sessionStorage`** via `useDashboardAuth` hook
- **Data fetching:** `'use client'` page with `useDashboard` hook → API routes → admin SDK
- **Transcript:** Inline-expandable rows (not modals) — keeps agent in context
- **Analytics:** Computed server-side in `/api/dashboard/stats` from single Firestore query

### New Files (15)
- `src/types/dashboard.ts` — DashboardLead, LeadsQueryParams, LeadsResponse, DashboardStats types
- `src/lib/firestore/dashboardLeads.ts` — Admin SDK queries (getAllLeads, getLeadById, updateLeadStatus, getDashboardStats)
- `src/app/api/dashboard/leads/route.ts` — GET leads with filters + auth
- `src/app/api/dashboard/leads/[id]/route.ts` — PATCH lead status + auth
- `src/app/api/dashboard/stats/route.ts` — GET analytics + auth
- `src/hooks/useDashboardAuth.ts` — Auth state (login/logout/getAuthHeaders/handleUnauthorized)
- `src/hooks/useDashboard.ts` — Data fetching (leads, stats, filters, status updates)
- `src/components/dashboard/LoginForm.tsx` — Password login form
- `src/components/dashboard/StatsCards.tsx` — 4 stat cards + status/urgency breakdowns
- `src/components/dashboard/LeadFilters.tsx` — Status, urgency, date range filters
- `src/components/dashboard/StatusSelect.tsx` — Inline status change dropdown
- `src/components/dashboard/LeadRow.tsx` — Lead table row (desktop + mobile card)
- `src/components/dashboard/LeadTable.tsx` — Responsive table with expandable rows
- `src/components/dashboard/TranscriptView.tsx` — Chat transcript display
- `src/app/dashboard/page.tsx` — Dashboard page (auth gate + content)

### Modified Files (2)
- `.env.example` — Added `DASHBOARD_PASSWORD`
- `CLAUDE.md` — Phase 3 documentation

### New Environment Variables
```
DASHBOARD_PASSWORD=your-dashboard-password-here  # Protects /dashboard admin page
```

### Dashboard Features
1. **Stats Cards:** Total leads, leads this week, avg response time, conversion rate
2. **Status/Urgency Breakdowns:** Visual progress bars by status and urgency
3. **Lead Table:** Sortable with name, contact, urgency badge, status badge, created date
4. **Status Updates:** Inline dropdown to change lead status (new → contacted → showing_booked → closed)
5. **Transcript Viewer:** Expandable inline view of full conversation transcript
6. **Filters:** Filter by status, urgency, date range with reset button
7. **Mobile Responsive:** Table switches to card layout on mobile
8. **Auth:** Password login with sessionStorage persistence

### Tests
- **471 tests passing** across 57 test files (95 new tests)
- New test files: dashboardLeads (Firestore), dashboard-leads API, dashboard-stats API, useDashboardAuth, useDashboard, LoginForm, DashboardComponents (StatsCards/LeadFilters/StatusSelect/TranscriptView/LeadRow/LeadTable), DashboardPage

### Notes
- Firestore composite index may be needed for `leads` (status + createdAt) — auto-generated URL on first query error
- `statusChangedAt` field added on first status change from 'new' for response time tracking
- Dashboard accessible at `/dashboard` — not linked from public pages (direct URL access for agents)

## Manual Testing & Bug Fixes (Post Phase 3)

### Bugs Found & Fixed
1. **Cal.com 404 error** — Default cal link `skyline-realty/showing` didn't exist. Updated to `bisrat09/property-showing` in `CalEmbed.tsx`
2. **Cal.com date grid hidden** — Booking embed container was `h-[350px] overflow-hidden`, cutting off dates. Changed to `h-[420px] overflow-y-auto` in `BookingPrompt.tsx`
3. **Budget "M" suffix not recognized** — "1M" wasn't parsed as $1,000,000. Added `[mM]` support to budget regexes in `useLeadCapture.ts`

### Previous Session Fixes (lead capture improvements)
- Budget now matches "budget 1000000" and "max 700K" (not just "$700K")
- Neighborhoods fuzzy match: "Queen Ann" → "Queen Anne"
- Property type: "family home" and "home" → `single_family`
- Timeline: "in 3 months" / "in 6 months" patterns captured

### Files Modified
- `src/components/booking/CalEmbed.tsx` — Cal.com link fix
- `src/components/booking/BookingPrompt.tsx` — Embed height/overflow fix
- `src/hooks/useLeadCapture.ts` — Budget M suffix + previous lead capture fixes
- `__tests__/unit/components/booking/CalEmbed.test.tsx` — Updated default link assertion
- `src/lib/email/templates/*.ts` — Email template improvements
- `src/prompts/systemPrompt.ts` — System prompt refinements

### Manual Testing Checklist
- Full checklist saved in `MANUAL_TESTING.md` (47 test cases for Phase 2 & 3)
- **44/47 tests PASSED** — 3 deferred (follow-up Day 1/3/7 templates need cron to fire after scheduled dates)

### Cal.com Setup
- Account: `bisrat09` on cal.com
- Event type: "Property Showing" (30 min, Cal Video)
- Embed link: `bisrat09/property-showing`
- Availability: Configure working hours in Cal.com dashboard (Availability → Working Hours)

## Phase 4: Voice AI Agent (Vapi) — COMPLETE

AI phone agent that answers after-hours calls, qualifies callers, suggests properties, books showings, and sends the agent a summary.

### Architecture
- **Voice AI provider:** Vapi (hosted, webhook-based, phone-first)
- **Model:** Claude (via Vapi's Anthropic integration)
- **Webhook:** `POST /api/vapi/webhook` — handles tool-calls, status-update, end-of-call-report
- **Tools:** captureLeadInfo, suggestProperties, bookShowing (executed server-side via webhook)
- **Dashboard:** Voice Calls tab added to `/dashboard` with expandable rows
- **Email:** Agent notification on call end with transcript + lead summary
- **Setup script:** `npm run setup:vapi` — creates/updates Vapi assistant with tools + system prompt

### New Files (19)
- `src/types/voice.ts` — VapiWebhookEvent, VoiceCall, CallStatus types + type guards
- `src/prompts/voiceSystemPrompt.ts` — Voice-optimized system prompt with listings context
- `src/lib/vapi.ts` — Vapi API client singleton (getCall, listCalls)
- `src/lib/firestore/voiceCalls.ts` — CRUD for `voice_calls` collection
- `src/lib/voice/handleToolCalls.ts` — captureLeadInfo/suggestProperties/bookShowing handlers
- `src/lib/voice/handleStatusUpdate.ts` — Call status tracking in Firestore
- `src/lib/voice/handleEndOfCall.ts` — Transcript save + lead creation + email notification
- `src/lib/voice/createLeadFromVoiceCall.ts` — Creates lead with `source: 'voice_call'`
- `src/lib/email/templates/voiceCallSummary.ts` — HTML email template for call summary
- `src/lib/email/voiceCallNotification.ts` — Email orchestrator for voice call notifications
- `src/app/api/vapi/webhook/route.ts` — Main webhook POST handler with secret validation
- `src/app/api/dashboard/voice-calls/route.ts` — GET voice calls with auth
- `src/components/dashboard/VoiceCallRow.tsx` — Expandable table row with transcript
- `src/components/dashboard/VoiceCallTable.tsx` — Table with empty state
- `src/hooks/useVoiceCalls.ts` — Fetch hook for voice calls
- `src/scripts/setupVapi.ts` — Vapi assistant setup/update script
- `__mocks__/vapi.ts` — Jest mock for Vapi client

### Modified Files (5)
- `src/app/dashboard/page.tsx` — Added Leads/Voice Calls tab switcher
- `jest.config.ts` — Added Vapi mock mapping
- `.env.example` — Added VAPI env vars
- `package.json` — Added `setup:vapi` script

### Firestore Schema: `voice_calls` Collection
```
id, vapiCallId, phoneNumber, leadId, status (queued|ringing|in-progress|forwarding|ended),
duration, transcript, summary, recordingUrl, extractedFields (ExtractedLeadFields),
createdAt, updatedAt, endedAt
```

### New Environment Variables
```
VAPI_API_KEY=your-vapi-api-key             # From dashboard.vapi.ai
VAPI_PHONE_NUMBER_ID=your-phone-number-id  # Vapi phone number ID
VAPI_ASSISTANT_ID=your-assistant-id        # Created by setup:vapi script
VAPI_WEBHOOK_SECRET=your-webhook-secret    # Shared secret for webhook validation
```

### Vapi Setup
```bash
# 1. Sign up at dashboard.vapi.ai
# 2. Get API key and (optionally) buy a phone number
# 3. Set env vars in .env.local
# 4. Run setup script:
npm run setup:vapi
# 5. Copy the assistant ID to .env.local
# 6. Deploy so the webhook URL is live
```

### Tests
- **565 tests passing** across 71 test files (94 new tests)
- New test files: voice types, voiceSystemPrompt, vapi client, voiceCalls Firestore, handleToolCalls, handleStatusUpdate, handleEndOfCall, createLeadFromVoiceCall, voiceCallSummary template, voiceCallNotification, vapi-webhook API, dashboard-voice-calls API, VoiceCallComponents, useVoiceCalls

### Notes
- Vapi uses `x-vapi-secret` header for webhook authentication
- Webhook validation is optional (skipped if `VAPI_WEBHOOK_SECRET` not set)
- Voice calls create leads with `source: 'voice_call'` for attribution
- End-of-call report triggers email notification to agent (same Resend setup as Phase 2)

## Security Hardening — COMPLETE

Full security audit and remediation across all priority levels.

### CRITICAL & HIGH (15 fixed, commit `89d8289`)
- Firestore security rules (`firestore.rules`) — public read listings, deny all else
- HTML injection fixed in all 6 email templates via `escapeHtml()`
- Rate limiting: chat (10/min), leads (5/min), dashboard (10/15min), cron (2/min), listings (30/min)
- Timing-safe Bearer auth (`timingSafeEqual`) on all 5 protected routes
- Vapi webhook fail-secure (deny on missing secret)
- Field allowlist in leads API (only accepted fields stored)
- Role validation (`user`/`assistant` only) + message limits (50 max, 10K chars) in chat API
- Client SDK writes removed from `leads.ts` (now read-only)
- Stale closure fixed in `useChat.ts`
- Batch limit (50) on `getPendingFollowUps`
- Listings API switched to admin SDK

### MEDIUM (8 of 9 fixed, commit `a89be79`)
- Security headers in `next.config.mjs`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `poweredByHeader: false`
- Dashboard auth: `useDashboardAuth.login()` now async, validates server-side before storing
- Rate limiter: `pruneExpired()` cleanup + rightmost `x-forwarded-for` IP (not spoofable leftmost)
- Numeric param validation in listings API (limit 1-100)
- Cron endpoint rate limited (2/min)
- Error logging sanitized — `error.message` only, no full objects

### LOW (all 7 fixed)
- Email validation: `isValidEmail()` check before Resend send in `leadNotification.ts` + leads route
- sessionId validation: max 128 chars, string type check in chat + leads routes
- Listings rate limiting: 30 req/min
- Dashboard query param validation: status, urgency, date, page, limit validated against allowed values
- Unsubscribe link: mailto unsubscribe footer in all 4 lead-facing email templates
- SITE_URL default: changed from `localhost:3000` to `https://skyline-reality.vercel.app` in all 5 templates
- Transcript size limit: capped at 100 messages in leads route

### Deferred
- Dependency vulnerabilities: `npm audit` fixes require breaking major upgrades (Next 14→16). Monitor for patch-level fixes.
- Firestore rules deploy: rules created, run `firebase deploy --only firestore:rules`

### Key Breaking Change
- `LoginForm.onLogin` prop: `(password: string) => void` → `(password: string) => Promise<boolean>`
- `useDashboardAuth().login()` is now async, returns `Promise<boolean>` (later updated to `{ success, error }` in QA-4)

### Tests
- **589 tests passing** across 74 test files (24 new tests for security fixes) — updated to 608 after QA pass

## QA Hardening Pass — COMPLETE (Commit `d48fb4c`)

Post-deployment QA review (Codex-identified defects). 7 of 8 fixed, 1 deferred.

### Fixes
- **QA-1. Same-session lead enrichment** — Replaced `submittedRef` gate with fingerprint comparison in `useLeadCapture.ts`. Visitors can share email first, then add phone/budget later — same lead record gets updated via sessionId upsert.
- **QA-2. False-positive name extraction** — Added blocklist of ~50 common non-name words to `leadExtraction.ts`. "I'm looking for a 3 bedroom" no longer pollutes lead names.
- **QA-3. Voice end-of-call idempotency** — `handleEndOfCall` checks `existing.leadId` before creating leads. Replayed webhooks update the voice call but skip duplicate lead creation. `createLeadFromVoiceCall` persists `agentNotificationSent`.
- **QA-4. Dashboard login/rate-limit coupling** — Created dedicated `POST /api/dashboard/login` with its own `dashboard-login` rate-limit bucket. `useDashboardAuth.login()` returns `{ success, error: LoginError }` with typed errors.
- **QA-5. Voice dashboard data integrity** — Moved date filtering from client-side to Firestore `.where()` queries in `getAllVoiceCalls()`, applied before `.limit()`.
- **QA-7. Google Fonts build dependency** — Removed `next/font/google`, switched to system font stack (`Inter, system-ui`) in Tailwind config and globals.css. Build succeeds offline.
- **QA-8. Voice tab unauthorized recovery** — `useVoiceCalls` accepts `onUnauthorized` callback. Dashboard passes `auth.handleUnauthorized` so 401 triggers login redirect.
- **QA-6. Dashboard auth storage** — DEFERRED. sessionStorage kept (HttpOnly cookies too invasive for demo).

### Key API Changes
- `useDashboardAuth().login()` now returns `Promise<{ success: boolean, error: LoginError }>` (was `Promise<boolean>`)
- `LoginError` type: `'invalid_password' | 'rate_limited' | 'network_error' | null`
- `useVoiceCalls()` now accepts optional `{ onUnauthorized }` options
- Dashboard page maps `LoginError` to user-facing messages via `LOGIN_ERROR_MESSAGES`

### New Files
- `src/app/api/dashboard/login/route.ts` — Dedicated login endpoint
- `__tests__/integration/api/dashboard-login.test.ts` — Login endpoint tests

### Modified Files (19)
- Source: `useDashboardAuth.ts`, `useLeadCapture.ts`, `useVoiceCalls.ts`, `leadExtraction.ts`, `voiceCalls.ts`, `createLeadFromVoiceCall.ts`, `handleEndOfCall.ts`, `dashboard/page.tsx`, `globals.css`, `layout.tsx`, `tailwind.config.ts`
- Tests: 8 test files updated with new assertions

### Tests
- **608 tests passing** across 75 test files (19 new tests for QA fixes)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm test             # Run all unit + integration tests (608 tests)
npm run test:coverage # Tests with coverage report
npm run test:e2e     # Playwright E2E tests
npm run seed         # Seed Firestore with sample listings
npm run setup:vapi   # Create/update Vapi assistant with tools
```

## Deployment — COMPLETE

- **Live at:** https://skyline-reality.vercel.app
- **GitHub auto-deploy:** bisrat09/skyline-reality → Vercel (push to main triggers deploy)
- **Vercel env vars:** 19 configured (Firebase, Anthropic, Resend, Cal.com, Dashboard, Vapi)
- **Vapi assistant:** Set via `VAPI_ASSISTANT_ID` env var (tested and working)
- **Latest commit:** `d48fb4c` — QA hardening (7 of 8 defects fixed)

## Demo Prep — COMPLETE (Commit `b969ee7`)

### Visual Polish
- Favicon: `src/app/icon.svg` (navy square + gold "S") + `src/app/apple-icon.png`
- OG image: `src/app/opengraph-image.tsx` (dynamic, edge runtime)
- Fonts: System font stack (Inter, system-ui) — `next/font/google` removed in QA-7 for offline builds
- Chat button pulse animation, smoother panel transition
- Custom 404: `src/app/not-found.tsx`
- Dashboard loading skeleton: `src/app/dashboard/loading.tsx`
- Dashboard empty states improved, footer dead links removed, hero gradient fallback

### Sales Documents
- `DEMO_SCRIPT.md` — 12-15 min walkthrough script with objection handlers
- `README.md` — client-facing project overview
- `PITCH.md` — sales one-pager with ROI calculator and pricing

## Custom Skill: `/skyline-realty-demo`

A Claude Code skill for scaffolding city-specific Skyline Realty demos. Stored at `~/.claude/skills/skyline-realty-demo/` (personal, available across all projects).

### Usage
```
/skyline-realty-demo Austin TX
/skyline-realty-demo Denver CO
```

### What It Does
1. Researches the target city (neighborhoods, prices, landmarks, walk scores)
2. Generates 15 realistic seed listings in `src/data/seedListings.ts`
3. Updates system prompts (chat + voice) — swaps "Seattle" for the new city
4. Updates UI components (Hero, Services, Footer) with city name
5. Updates SEO metadata (title, keywords, OpenGraph, Twitter)
6. Updates email templates with city references
7. Updates `DEMO_SCRIPT.md` with city-specific examples
8. Runs tests + build to verify nothing broke

### Skill Files
- `SKILL.md` — Main instructions with 8-phase workflow
- `listing-template.md` — TypeScript structure, distribution targets, regional feature ideas
- `change-manifest.md` — Exact files to modify vs. files to leave alone
- `demo-script-template.md` — Demo walkthrough template with city placeholders

### Files Modified Per City Adaptation (13)
- `src/data/seedListings.ts` — full rewrite (15 listings)
- `src/prompts/systemPrompt.ts` — city name swaps
- `src/prompts/voiceSystemPrompt.ts` — city name swaps
- `src/components/sections/Hero.tsx` — heading city name
- `src/components/sections/Services.tsx` — city knowledge reference
- `src/components/layout/Footer.tsx` — tagline + footer city
- `src/app/layout.tsx` — metadata, keywords, OG tags
- `src/lib/email/templates/*.ts` — 6 email templates (city references)
- `DEMO_SCRIPT.md` — example queries, neighborhoods, area codes

### Files That Do NOT Change
All types, API routes, hooks, dashboard, components/ui, booking, tests, config — infrastructure is city-agnostic.
