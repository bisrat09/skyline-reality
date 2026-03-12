# Skyline Realty — AI-Powered Lead Capture for Real Estate

> Every lead gets a response in under 60 seconds, 24/7. No leads fall through the cracks.

**Live Demo:** [skyline-reality.vercel.app](https://skyline-reality.vercel.app)
**Dashboard:** [skyline-reality.vercel.app/dashboard](https://skyline-reality.vercel.app/dashboard)
**Agent Onboarding:** [skyline-reality.vercel.app/onboarding](https://skyline-reality.vercel.app/onboarding)

---

## What It Does

### For Your Buyers
- **24/7 AI Chat** — visitors get instant, knowledgeable answers about properties, neighborhoods, and the buying process
- **Smart Property Matching** — AI suggests listings based on budget, location, bedrooms, and preferences
- **Easy Scheduling** — book showings directly through the chat, synced with your real calendar

### For You, the Agent
- **Instant Lead Alerts** — get an email with full lead details the moment someone engages
- **Automatic Qualification** — every lead arrives with budget, timeline, neighborhood preferences, and urgency level (hot/warm/cold)
- **7-Day Follow-Up Sequence** — automated emails keep every lead warm: Day 1 (new listings), Day 3 (market insights), Day 7 (re-engagement)
- **Lead Dashboard** — see all your leads, conversation transcripts, urgency, and status in one place
- **Voice AI Agent** — AI answers your phone after hours, qualifies callers, and books appointments

---

## How It Works

```
Visitor lands on your website
        ↓
Chats with AI about properties
        ↓
AI captures contact info + preferences
        ↓
You get an instant email notification
Lead gets a personalized welcome email
        ↓
Automated follow-up over 7 days
        ↓
You close the deal
```

---

## What's Included

| Feature | Description |
|---------|-------------|
| Professional Website | Modern, mobile-responsive real estate site with your branding |
| AI Chatbot | Trained on your listings and market, answers questions 24/7 |
| Lead Capture | Extracts name, email, phone, budget, timeline, neighborhoods |
| Instant Notifications | Agent email alert within 60 seconds of lead capture |
| Email Follow-Up | Automated Day 1, 3, 7 sequence keeps leads engaged |
| Lead Dashboard | Real-time view of all leads, transcripts, and analytics |
| Calendar Integration | Buyers book showings directly through the chat |
| Voice AI (optional) | AI phone agent for after-hours calls |
| Agent Onboarding | 5-step wizard: profile, greeting, listings, calendar, preview |
| Analytics | Total leads, response times, conversion rates, urgency breakdown |

---

## Tech Stack

Built with modern, reliable technology:

- **Next.js** — fast, SEO-friendly React framework
- **Claude AI** — Anthropic's conversational AI for natural chat
- **Firebase** — real-time database for leads and listings
- **Resend** — reliable email delivery for notifications and follow-ups
- **Cal.com** — calendar integration for booking showings
- **Vapi** — voice AI for phone agent capability
- **Vercel** — global deployment with auto-scaling

---

## Getting Started

### For Developers

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in API keys (see .env.example for details)

# Seed the database with sample listings
npm run seed

# Start development server
npm run dev

# Run tests (646 tests across 79 suites)
npm test

# Production build
npm run build
```

### For Clients

See [PITCH.md](PITCH.md) for pricing and implementation details.

---

## Project Structure

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/chat/           # AI chatbot endpoint
│   ├── api/leads/          # Lead capture endpoint
│   ├── api/vapi/           # Voice AI webhook
│   ├── api/dashboard/      # Dashboard API (auth-protected)
│   ├── api/onboarding/     # Agent onboarding API
│   ├── api/cron/           # Scheduled follow-up jobs
│   ├── dashboard/          # Lead management dashboard
│   ├── onboarding/         # Agent onboarding wizard
│   └── booking/            # Calendar booking page
├── components/             # React components
│   ├── chat/               # Chat widget system
│   ├── dashboard/          # Dashboard components
│   ├── sections/           # Landing page sections
│   ├── listings/           # Property cards and grids
│   ├── booking/            # Calendar embed
│   ├── onboarding/         # Onboarding wizard steps
│   ├── layout/             # Navbar, footer
│   └── ui/                 # Reusable UI primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, Firebase, email
├── prompts/                # AI system prompts
├── types/                  # TypeScript type definitions
└── data/                   # Seed data (15 Seattle properties)
```

---

*Built for real estate agents who want every lead to count.*
