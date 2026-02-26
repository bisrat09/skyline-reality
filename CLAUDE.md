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
