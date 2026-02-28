# Skyline Realty AI Demo

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
npm test             # Run all unit + integration tests
npm run test:coverage # Tests with coverage report
npm run test:e2e     # Playwright E2E tests
npm run seed         # Seed Firestore with sample listings
```
