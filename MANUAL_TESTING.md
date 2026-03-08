# Skyline Realty — Manual Testing Checklist

> Last updated: 2026-03-08
> Status: Phase 2 & 3 testing complete — 44/47 tests PASSED (3 deferred: follow-up templates need cron trigger)

---

## Bugs Fixed

### Session 2 (current)
4. **Dashboard filter 500 error** — `where()` + `orderBy('createdAt')` on different fields requires a Firestore composite index. Fixed by sorting client-side when filters are active in `dashboardLeads.ts`.
5. **Firestore composite index missing** — Cron endpoint `getPendingFollowUps()` query on `status` + `scheduledAt` needed a composite index. Created via Firebase Console.
6. **SITE_URL wrong port** — Was `localhost:3001`, corrected to `localhost:3000` in `.env.local`.

### Session 1
1. **Cal.com 404 error** — Default cal link was `skyline-realty/showing` (non-existent). Updated to `bisrat09/property-showing` in `CalEmbed.tsx`.
2. **Cal.com dates not showing** — Booking embed container was `h-[350px] overflow-hidden`, cutting off the date grid. Changed to `h-[420px] overflow-y-auto` in `BookingPrompt.tsx`.
3. **Budget "M" suffix not recognized** — "1M" wasn't parsed as $1,000,000. Added `[mM]` support to both `BUDGET_REGEX_DOLLAR` and `BUDGET_REGEX_WORD` in `useLeadCapture.ts`.

## Code Changes

| File | Change | Session |
|------|--------|---------|
| `src/components/booking/CalEmbed.tsx` | `DEFAULT_CAL_LINK` → `bisrat09/property-showing` | 1 |
| `src/components/booking/BookingPrompt.tsx` | Embed container: `h-[420px] overflow-y-auto` | 1 |
| `src/hooks/useLeadCapture.ts` | Budget regex supports M/m (millions) suffix | 1 |
| `__tests__/unit/components/booking/CalEmbed.test.tsx` | Updated default calLink assertion | 1 |
| `src/lib/firestore/dashboardLeads.ts` | Client-side sort when filters active (avoids composite index) | 2 |
| `src/components/dashboard/TranscriptView.tsx` | Strip `[SUGGEST_PROPERTY]`, `[BOOK_SHOWING]` markers + `**bold**` from transcript | 2 |
| `.env.local` | `SITE_URL` fixed to `:3000` | 2 |

## Previous Session Fixes (context cleared)

- **Budget** — now matches "budget 1000000" and "max 700K" (not just "$700K")
- **Neighborhoods** — fuzzy match: "Queen Ann" now matches "Queen Anne"
- **Property type** — "family home" and "home" now match as `single_family`
- **Timeline** — "in 3 months" / "in 6 months" patterns now captured

---

## Phase 2: Automated Lead Follow-Up

### 2.1 Instant Email Triggering

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.1.1 | Agent notification email on NEW lead | Chat → provide name, email, phone, budget → lead captured | Agent receives email within seconds with urgency badge (HOT/WARM/COLD), lead summary, conversation highlights, "Contact Lead Now" CTA | PASSED |
| 2.1.2 | Lead welcome email on NEW lead | Same as 2.1.1 | Lead receives welcome email with personalized greeting, search criteria, "Browse Listings" CTA | PASSED |
| 2.1.3 | No duplicate emails on lead update | Chat again with same session, provide more info | First submission: emails sent. Second: NO new emails, only Firestore doc updated | PASSED |
| 2.1.4 | Email failure graceful | Set `RESEND_API_KEY=re_invalid_key_12345` in .env.local, restart server, chat and trigger lead | Lead still created (201 response), emails fail silently | PASSED |
| 2.1.5 | Email with minimal lead data | Submit lead with email-only (no name, budget, etc.) | Agent email shows "Not specified" for missing fields. Welcome email says "Hi there!" | PASSED |
| 2.1.6a | Urgency = HOT (score >= 8) | Provide email + phone + name + budget + timeline(asap) | Lead marked "hot", email badge red | PASSED |
| 2.1.6b | Urgency = WARM (score 4-7) | Provide email + phone + name only | Lead marked "warm", email badge gold | PASSED |
| 2.1.6c | Urgency = COLD (score < 4) | Provide only email | Lead marked "cold", email badge blue | PASSED |

### 2.2 Follow-Up Scheduling

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.2.1 | 3 follow-ups created for new lead | Create new lead with email | Firestore `follow_ups` has 3 docs: day1/day3/day7, all `pending` | PASSED |
| 2.2.2 | No follow-ups without email | Create lead with phone-only | No docs in `follow_ups`, lead doc shows `followUpScheduled: false` | PASSED |

### 2.3 Cron Endpoint

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.3.1 | Manual cron invocation | `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/follow-ups` | `{ success: true, processed: 0, sent: 0, failed: 0 }` | PASSED |
| 2.3.2a | Cron — missing auth | `curl http://localhost:3000/api/cron/follow-ups` | 401 Unauthorized | PASSED |
| 2.3.2b | Cron — wrong secret | `curl -H "Authorization: Bearer wrong" http://localhost:3000/api/cron/follow-ups` | 401 Unauthorized | PASSED |

### 2.4 Email Template Rendering

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.4.1 | Agent notification template | Check in Resend dashboard or Gmail | Navy header, urgency badge, lead details table, highlights, CTA button, footer | PASSED |
| 2.4.2 | Lead welcome template | Check in Resend dashboard or Gmail | Logo, personalized greeting, search criteria box, "Browse Listings" CTA | PASSED |
| 2.4.3 | Follow-up Day 1 | Trigger via cron (or manually in Firestore) | Subject mentions neighborhood, "View Matching Listings" + "Schedule a Showing" CTAs | |
| 2.4.4 | Follow-up Day 3 | Same | Market insights, "Chat With Our AI" CTA | |
| 2.4.5 | Follow-up Day 7 | Same | Re-engagement tone, "See What's New" + "Book a Free Consultation" CTAs | |

### 2.5 Firestore Data Verification

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.5.1 | Lead doc structure | Check Firestore console → `leads` | Has: name, email, phone, budgetMin/Max, timeline, neighborhoods[], propertyType, bedroomsMin, status, urgency, transcript[], source, sessionId, followUpScheduled, welcomeEmailSent, agentNotificationSent, createdAt, updatedAt | PASSED |
| 2.5.2 | Follow-up doc structure | Check Firestore → `follow_ups` | Has: leadId, leadEmail, leadName, type, status, scheduledAt, sentAt, failedAt, failureReason, createdAt, updatedAt | PASSED |

### 2.6 Edge Cases

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 2.6.1 | Lead without contact info | POST `/api/leads` with no email and no phone | 400: "At least one contact method required" | PASSED |
| 2.6.2 | Lead without sessionId | POST `/api/leads` with no sessionId | 400: "sessionId is required" | PASSED |
| 2.6.3 | Very long transcript (50+ messages) | Have long conversation, submit lead | Lead created with full transcript. Agent email shows up to 5 highlights (150 char truncated) | |

---

## Phase 3: Lead Dashboard

### 3.1 Authentication

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.1.1 | Login page renders | Navigate to `/dashboard` | Shows LoginForm with password input and "Sign In" button | PASSED |
| 3.1.2 | Successful login | Enter correct password (from `DASHBOARD_PASSWORD` env var) | Dashboard content loads | PASSED |
| 3.1.3 | Failed login | Enter wrong password | Returns to login (401 caught) | PASSED |
| 3.1.4 | Session persistence | Log in → close tab → reopen `/dashboard` | Still logged in (sessionStorage persists during browser session) | PASSED |
| 3.1.5 | Logout | Click "Logout" button | sessionStorage cleared, login form shown | PASSED |

### 3.2 Stats Cards

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.2.1 | 4 stat cards display | Have 3-5 leads in Firestore, visit dashboard | "Total Leads", "This Week", "Avg Response", "Conversion" cards with correct values | PASSED |
| 3.2.2 | By Status breakdown | Create leads with all 4 statuses | Progress bars for new/contacted/showing_booked/closed with correct counts | PASSED |
| 3.2.3 | By Urgency breakdown | Create leads with hot/warm/cold | Progress bars with correct counts | PASSED |
| 3.2.4 | Avg Response Time | Update a lead status from "new" → "contacted" | Shows minutes between createdAt and statusChangedAt. "—" if no changes yet | PASSED |
| 3.2.5 | Conversion Rate | Have some leads with status "closed" | Shows `(closedCount / totalLeads) * 100` rounded | PASSED |

### 3.3 Lead Table

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.3.1 | Table columns | View dashboard with leads | Columns: Name, Contact, Urgency, Status, Update, Created, Transcript | PASSED |
| 3.3.2 | Lead row data | Create lead with full data | Shows name, email+phone, urgency badge (colored), status badge, formatted date | PASSED |
| 3.3.3 | Missing data display | Lead with no name/email | Name: "Anonymous", Email: "—" | PASSED |
| 3.3.4 | Urgency badge colors | Leads with different urgencies | HOT=red, WARM=gold, COLD=blue | PASSED |
| 3.3.5 | Status badge colors | Leads with different statuses | New=gray, Contacted=gray, Showing Booked=gold, Closed=green | PASSED |

### 3.4 Filters

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.4.1 | Filter by status | Select "Contacted" from dropdown | Only contacted leads shown | PASSED |
| 3.4.2 | Filter by urgency | Select "Hot" from dropdown | Only hot leads shown | PASSED |
| 3.4.3 | Filter by date range | Set start/end dates | Only leads within range shown | PASSED |
| 3.4.4 | Combined filters (AND) | Set status + urgency + date range | Only leads matching ALL criteria shown | PASSED |
| 3.4.5 | Reset filters | Click "Reset" button | All filters cleared, all leads shown | PASSED |

### 3.5 Status Updates

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.5.1 | Change lead status | Select new status from dropdown | PATCH request sent, table refreshes, stats update | PASSED |
| 3.5.2 | statusChangedAt tracking | Update "new" lead to "contacted" | Firestore: `statusChangedAt` set. Subsequent changes don't overwrite | PASSED |
| 3.5.3 | Unauthorized update | Call PATCH without auth | 401, redirected to login | PASSED |

### 3.6 Transcript Viewer

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.6.1 | Expand transcript | Click "View" button | Row expands, shows transcript. Button changes to "Hide" | PASSED |
| 3.6.2 | Message styling | Expand transcript | User messages right-aligned (navy), assistant left-aligned (gray) | PASSED |
| 3.6.3 | Empty transcript | Lead with no transcript | "No conversation transcript available." | PASSED |
| 3.6.4 | Long transcript | 50+ messages | Scrollable container (max-h-96), all messages accessible | PASSED |
| 3.6.5 | Expand/collapse toggle | Click "View" then "Hide" | Transcript appears/disappears correctly | PASSED |

### 3.7 Mobile Responsive

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.7.1 | Mobile login | View `/dashboard` on mobile width (<480px) | Centered logo, full-width input and button | PASSED |
| 3.7.2 | Mobile stats cards | View stats on mobile | 2-column grid, breakdowns stack vertically | PASSED |
| 3.7.3 | Mobile lead cards | View leads on mobile | Table → card layout, each card shows all fields | PASSED |
| 3.7.4 | Mobile transcript | Expand transcript on mobile | Readable, scrollable within card | PASSED |
| 3.7.5 | Mobile filters | View filters on mobile | Dropdowns and dates wrap/stack | PASSED |

### 3.8 API Endpoints

| # | Test | How to Test | Expected Result | Status |
|---|------|-------------|-----------------|--------|
| 3.8.1 | GET /api/dashboard/leads | `curl -H "Authorization: Bearer $PASS" localhost:3000/api/dashboard/leads` | JSON with leads array, total, page, limit | PASSED |
| 3.8.2 | GET /api/dashboard/stats | `curl -H "Authorization: Bearer $PASS" localhost:3000/api/dashboard/stats` | JSON with totalLeads, leadsThisWeek, byStatus, byUrgency, avgResponseTimeMinutes, conversionRate | PASSED |
| 3.8.3 | PATCH /api/dashboard/leads/:id | `curl -X PATCH -H "Authorization: Bearer $PASS" -d '{"status":"contacted"}' localhost:3000/api/dashboard/leads/ID` | `{ success: true, leadId, newStatus }` | PASSED |
| 3.8.4 | API 401 | Call any dashboard API without auth | `{ error: "Unauthorized" }` | PASSED |
| 3.8.5 | API 400 | PATCH with invalid status | `{ error: "Invalid status..." }` | PASSED |
| 3.8.6 | API 404 | PATCH non-existent lead ID | `{ error: "Lead not found: ..." }` | PASSED |

---

## End-to-End: Full User Journey

| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | Chat on homepage, provide name/email/phone/budget/neighborhood | Bot suggests properties, captures lead info | |
| 2 | Lead auto-submitted | POST `/api/leads` returns 201, lead in Firestore | |
| 3 | Instant emails | Agent notification + lead welcome emails sent | |
| 4 | Follow-ups scheduled | 3 docs in `follow_ups` collection (day1/3/7) | |
| 5 | Dashboard login | `/dashboard` → enter password → dashboard loads | |
| 6 | Lead visible | New lead appears in table with correct data | |
| 7 | Expand transcript | Conversation transcript displays correctly | |
| 8 | Update status | Change "new" → "contacted", stats update | |
| 9 | Cron sends follow-ups | Day1/3/7 emails sent on schedule | |

---

## Environment Variables Required

```env
ANTHROPIC_API_KEY=sk-ant-...
FIREBASE_PROJECT_ID=skyline-realty-f038b
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN..."
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
RESEND_API_KEY=re_...
AGENT_EMAIL=agent@example.com
AGENT_NAME=Sarah Chen
CRON_SECRET=your-secret
SITE_URL=http://localhost:3000
NEXT_PUBLIC_CALCOM_LINK=bisrat09/property-showing
DASHBOARD_PASSWORD=skyline-admin-2026
```

## Testing Tools

- **Firestore Console:** https://console.firebase.google.com → skyline-realty-f038b
- **Resend Dashboard:** https://resend.com/emails
- **Browser DevTools:** Cmd+Option+I → Network tab (Fetch/XHR filter, Preserve log)
- **curl** for manual API testing
- `npm test` — 471 unit/integration tests
