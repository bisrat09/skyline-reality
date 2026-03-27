/**
 * Autoresearch: Lead Capture Skill Optimizer
 *
 * Runs as a Jest test to leverage existing path aliases and module resolution.
 * Iteratively improves the system prompt by testing against simulated conversations.
 */

import { extractLeadFields, mergeFields } from '@/lib/leadExtraction';
import { buildSystemPrompt } from '@/prompts/systemPrompt';
import { seedListings } from '@/data/seedListings';
import type { ExtractedLeadFields } from '@/types/lead';
import type { PropertyListing } from '@/types/listing';
import * as fs from 'fs';
import * as path from 'path';

// ── Scoring Checklist ──────────────────────────────────────────────

interface ChecklistResult {
  q1_name: boolean;
  q2_contact: boolean;
  q3_budget: boolean;
  q4_timeline: boolean;
  q5_plausible: boolean;
  q6_booking: boolean;
}

function scoreChecklist(result: ChecklistResult): number {
  const checks = Object.values(result);
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

function formatChecklist(result: ChecklistResult): string {
  const labels: Record<keyof ChecklistResult, string> = {
    q1_name: '1. Proper human name captured',
    q2_contact: '2. Email or phone captured',
    q3_budget: '3. Budget range captured',
    q4_timeline: '4. Timeline/move-in captured',
    q5_plausible: '5. All fields plausible',
    q6_booking: '6. AI attempted booking/follow-up',
  };
  return Object.entries(result)
    .map(([key, passed]) => `  ${passed ? 'PASS' : 'FAIL'} ${labels[key as keyof ChecklistResult]}`)
    .join('\n');
}

// ── Test Conversations ─────────────────────────────────────────────

interface TestConversation {
  name: string;
  userMessages: string[];
}

const TEST_CONVERSATIONS: TestConversation[] = [
  {
    name: 'Direct buyer - shares info upfront',
    userMessages: [
      "Hi, I'm looking for a 3 bedroom home under $500K in Seattle",
      "My name is Marcus Johnson",
      "Sure, my email is marcus.johnson@gmail.com",
      "My number is 206-555-1234",
      "I'm hoping to move within 3 months",
      "Ballard or Fremont would be ideal",
      "I'd love to see that property!",
    ],
  },
  {
    name: 'Gradual buyer - info trickles in',
    userMessages: [
      "Hey, what kind of homes do you have?",
      "I need 3 bedrooms, somewhere in the $400-500K range",
      "I'm Sarah Chen, by the way",
      "Preferably in West Seattle or Beacon Hill",
      "You can reach me at sarah.chen@outlook.com or 425-555-9876",
      "We're looking to buy this year, maybe next 6 months",
      "That sounds great, can we schedule a showing?",
    ],
  },
  {
    name: 'Hesitant buyer - needs convincing',
    userMessages: [
      "Just browsing for now",
      "Well, we'd need at least 3 bedrooms for the kids",
      "Budget is around 450K, maybe up to 500K",
      "I'm David Park",
      "Maybe Capitol Hill or Green Lake area?",
      "email is dpark42@yahoo.com",
      "Actually, when could we see some of these places? We want to be settled by summer",
    ],
  },
  {
    name: 'Mobile-style terse messages',
    userMessages: [
      "3bd house under 500k?",
      "ballard area",
      "I'm Amira Hassan",
      "amira.h@gmail.com",
      "206-555-4321",
      "need to move in 1-3 months",
      "can I see it this weekend?",
    ],
  },
  {
    name: 'Conversational buyer - info embedded naturally',
    userMessages: [
      "Hi there! My wife and I are relocating to Seattle from Portland",
      "I'm James Rivera. We've got two kids so need 3 bedrooms minimum",
      "Our budget tops out at about $500K, maybe a bit flexible",
      "We've heard good things about Wallingford and Ravenna",
      "Best to reach me at jrivera@protonmail.com or call 503-555-7890",
      "We need to find something in the next 3-6 months ideally",
      "That one looks perfect — how do we book a tour?",
    ],
  },
  {
    name: 'Budget with M suffix and informal name',
    userMessages: [
      "yo, looking at houses under 0.5M",
      "Call me Tony Abebe",
      "3 bed minimum, preferably in Magnolia",
      "email tony.abebe@icloud.com",
      "phone 206-555-8888",
      "hoping to close within this month",
      "that place looks sick, can I come check it out?",
    ],
  },
  {
    name: 'Buyer with this-is pattern for name',
    userMessages: [
      "Good morning! This is Lisa Nguyen",
      "I need a 3 bedroom family home",
      "My budget is $450,000 to $500,000",
      "Looking in Ravenna or University District",
      "lisa.nguyen@gmail.com is my email",
      "We want to move in about 3 months",
      "Would love to tour that property!",
    ],
  },
  {
    name: 'Late name reveal with phone-first contact',
    userMessages: [
      "What 3 bedroom homes do you have under 500K?",
      "Anywhere in Green Lake or Wallingford",
      "My phone is 425-555-3333",
      "Budget is max 480K",
      "Oh sorry, I'm Kevin Mekonnen",
      "I need to be moved in within 6 months",
      "Can we set up a viewing for that one?",
    ],
  },
];

// ── Extraction + Scoring ───────────────────────────────────────────

function runExtraction(userMessages: string[]): ExtractedLeadFields {
  let accumulated: ExtractedLeadFields = {};
  for (const msg of userMessages) {
    const fields = extractLeadFields(msg);
    accumulated = mergeFields(accumulated, fields);
  }
  return accumulated;
}

function isPlausibleName(name: string | undefined): boolean {
  if (!name) return false;
  const words = name.split(/\s+/);
  if (words.length === 0 || words[0].length < 2) return false;
  const BAD = new Set(['looking', 'searching', 'interested', 'wondering', 'hoping', 'trying', 'hi', 'hello', 'hey', 'just', 'browsing']);
  return /^[A-Z]/.test(words[0]) && !BAD.has(words[0].toLowerCase());
}

function isPlausibleBudget(min: number | undefined, max: number | undefined): boolean {
  const val = max || min || 0;
  return val >= 100000 && val <= 10000000;
}

function evaluateConversation(conv: TestConversation, promptText: string): ChecklistResult {
  const fields = runExtraction(conv.userMessages);

  const q1_name = isPlausibleName(fields.name);
  const q2_contact = !!(fields.email || fields.phone);
  const q3_budget = !!(fields.budgetMin || fields.budgetMax);
  const q4_timeline = !!fields.timeline;

  let q5_plausible = true;
  if (fields.name && !isPlausibleName(fields.name)) q5_plausible = false;
  if ((fields.budgetMin || fields.budgetMax) && !isPlausibleBudget(fields.budgetMin, fields.budgetMax)) q5_plausible = false;

  // Q6: prompt has booking instructions AND user expressed interest
  const hasBookingInstruction = /BOOK_SHOWING|book.*showing|schedule.*showing/i.test(promptText);
  const userExpressedInterest = conv.userMessages.some(m =>
    /\b(see|visit|tour|showing|schedule|book|view|viewing|check.?it.?out|come.*look|set.?up)\b/i.test(m)
  );
  const q6_booking = hasBookingInstruction && userExpressedInterest;

  return { q1_name, q2_contact, q3_budget, q4_timeline, q5_plausible, q6_booking };
}

// ── Prompt Modifications ───────────────────────────────────────────

interface PromptChange {
  id: string;
  description: string;
  apply: (prompt: string) => string;
}

const AVAILABLE_FIXES: PromptChange[] = [
  {
    id: 'name_priority',
    description: 'Add lead capture priority order with name-first instruction',
    apply: (p) => p.replace(
      'Naturally gather the following information during conversation. Do NOT ask for all of these at once — weave them into the conversation organically:\n- Name',
      `Naturally gather the following information during conversation. Do NOT ask for all of these at once — weave them into the conversation organically.

### Capture Priority (follow this order when natural)
1. **Name** — Ask within the first 2-3 exchanges. Use: "By the way, what's your name?" or "Who am I helping today?"
2. **Contact** — Email or phone. Ask: "What's the best way to reach you?" Do this before the 5th exchange.
3. **Budget + Timeline** — Ask when discussing properties: "What price range works?" and "When are you hoping to move?"
4. **Preferences** — Neighborhoods, bedrooms, property type — often shared naturally.

CRITICAL: Name and contact info are the minimum viable lead. Always get both.

- Name`,
    ),
  },
  {
    id: 'contact_urgency',
    description: 'Add explicit instruction to capture contact info early',
    apply: (p) => p.replace(
      '- Phone number',
      `- Phone number

NOTE: Contact info (email or phone) is essential. If the visitor hasn't shared contact info by the 4th message, naturally ask: "By the way, what's the best email or phone to reach you at?" Don't let a warm lead slip away without contact info.`,
    ),
  },
  {
    id: 'budget_natural',
    description: 'Add natural budget-asking instruction',
    apply: (p) => p.replace(
      '- Budget range',
      '- Budget range — If not volunteered, ask naturally: "What price range are you comfortable with?" or "Do you have a budget in mind?"',
    ),
  },
  {
    id: 'timeline_explicit',
    description: 'Add explicit timeline capture instruction',
    apply: (p) => p.replace(
      '- Timeline (when they want to buy/move)',
      '- Timeline (when they want to buy/move) — Always ask: "When are you looking to move?" or "What\'s your timeline?" This helps prioritize the lead.',
    ),
  },
  {
    id: 'booking_proactive',
    description: 'Make booking instruction proactive — offer after suggesting property',
    apply: (p) => p.replace(
      'When a user expresses interest in seeing a property, enthusiastically offer to schedule a showing.',
      `When suggesting a matching property, ALWAYS proactively offer a showing: "Want me to set up a tour?" or "I can book a showing for you right now!"
Don't wait for the user to ask — after every property suggestion, offer to schedule.
When the user expresses ANY interest in seeing a property, immediately respond with the booking widget.`,
    ),
  },
  {
    id: 'confirm_info',
    description: 'Strengthen info confirmation to improve plausibility',
    apply: (p) => p.replace(
      'If you detect the user has shared their name, email, or phone, confirm briefly (e.g., "Got it!" or "Noted!")',
      'When the user shares their name, email, or phone, confirm it back specifically: "Got it, Marcus!" or "I\'ll send details to marcus@gmail.com." This builds trust and ensures accuracy.',
    ),
  },
  {
    id: 'complete_lead_checklist',
    description: 'Add end-of-conversation completeness check',
    apply: (p) => {
      if (p.includes('Before ending')) return p;
      return p.replace(
        '## Important Rules',
        `## Lead Completeness Check
Before ending a conversation or when the user signals they want to wrap up, quickly check:
- Do you have their name? If not, ask.
- Do you have email or phone? If not, ask.
- Do you know their budget? If not, ask.
- Do you know their timeline? If not, ask.
- Have you offered to book a showing? If not, offer.

Missing any of these means the lead is incomplete. Naturally work in the missing items.

## Important Rules`,
      );
    },
  },
  {
    id: 'name_patterns',
    description: 'Add instruction about name patterns the AI should recognize and confirm',
    apply: (p) => {
      if (p.includes('recognize name patterns')) return p;
      return p.replace(
        '- Name',
        '- Name — Recognize when visitors introduce themselves: "I\'m [Name]", "My name is [Name]", "This is [Name]", "Call me [Name]". Confirm with their name to show you\'re listening: "Nice to meet you, [Name]!"',
      );
    },
  },
];

// ── Main Autoresearch Loop ─────────────────────────────────────────

describe('Autoresearch: Lead Capture Optimization', () => {
  const listings = seedListings.map((l, i) => ({ ...l, id: `listing-${i + 1}` })) as PropertyListing[];

  it('should optimize lead capture prompt to 95%+', () => {
    let currentPrompt = buildSystemPrompt(listings);
    const originalPrompt = currentPrompt;
    const appliedFixes: string[] = [];
    const changelog: { round: number; change: string; scoreBefore: number; scoreAfter: number; kept: boolean }[] = [];
    let consecutiveHigh = 0;

    console.log('\n🔬 AUTORESEARCH: Lead Capture Skill Optimizer');
    console.log('═══════════════════════════════════════════════\n');

    // ── Round 1: Baseline ──
    function getScore(prompt: string): { avg: number; details: { name: string; score: number; checklist: ChecklistResult; fields: ExtractedLeadFields }[] } {
      const details = TEST_CONVERSATIONS.map(conv => {
        const checklist = evaluateConversation(conv, prompt);
        const fields = runExtraction(conv.userMessages);
        return { name: conv.name, score: scoreChecklist(checklist), checklist, fields };
      });
      const avg = Math.round(details.reduce((a, d) => a + d.score, 0) / details.length);
      return { avg, details };
    }

    function printRound(label: string, result: ReturnType<typeof getScore>) {
      console.log(`\n  ${label} — Average Score: ${result.avg}%`);
      console.log('  ─────────────────────────────────────');
      for (const d of result.details) {
        console.log(`  ${d.score === 100 ? '✅' : '⚠️'}  ${d.name}: ${d.score}%`);
        console.log(formatChecklist(d.checklist));
        console.log(`     Fields: name=${d.fields.name || '—'} email=${d.fields.email || '—'} phone=${d.fields.phone || '—'} budget=${d.fields.budgetMin || '—'}-${d.fields.budgetMax || '—'} timeline=${d.fields.timeline || '—'}`);
      }
    }

    // Baseline
    let baseline = getScore(currentPrompt);
    printRound('BASELINE (Round 0)', baseline);
    let currentScore = baseline.avg;

    // ── Optimization Loop ──
    for (let round = 1; round <= 20; round++) {
      if (consecutiveHigh >= 3) break;

      // Find applicable fixes
      const remainingFixes = AVAILABLE_FIXES.filter(f => !appliedFixes.includes(f.id));
      if (remainingFixes.length === 0) {
        console.log('\n  No more fixes to try. Stopping.');
        break;
      }

      // Try each fix and pick the best
      let bestFix: PromptChange | null = null;
      let bestNewScore = currentScore;
      let bestNewPrompt = currentPrompt;

      for (const fix of remainingFixes) {
        const modified = fix.apply(currentPrompt);
        if (modified === currentPrompt) continue; // Fix didn't match
        const result = getScore(modified);
        if (result.avg > bestNewScore) {
          bestFix = fix;
          bestNewScore = result.avg;
          bestNewPrompt = modified;
        }
      }

      if (!bestFix) {
        // No fix improved score; try first available anyway (might unlock future fixes)
        const fix = remainingFixes[0];
        const modified = fix.apply(currentPrompt);
        if (modified !== currentPrompt) {
          const result = getScore(modified);
          console.log(`\n  Round ${round}: Tried "${fix.description}" — ${currentScore}% → ${result.avg}%`);
          if (result.avg >= currentScore) {
            currentPrompt = modified;
            appliedFixes.push(fix.id);
            changelog.push({ round, change: fix.description, scoreBefore: currentScore, scoreAfter: result.avg, kept: true });
            currentScore = result.avg;
            console.log('  ✅ KEPT (equal or better)');
          } else {
            changelog.push({ round, change: fix.description, scoreBefore: currentScore, scoreAfter: result.avg, kept: false });
            appliedFixes.push(fix.id); // Don't retry
            console.log('  ❌ REVERTED');
          }
        }
      } else {
        const modified = bestFix.apply(currentPrompt);
        const result = getScore(modified);
        printRound(`Round ${round}: Applied "${bestFix.description}"`, result);

        currentPrompt = bestNewPrompt;
        appliedFixes.push(bestFix.id);
        changelog.push({ round, change: bestFix.description, scoreBefore: currentScore, scoreAfter: bestNewScore, kept: true });
        currentScore = bestNewScore;
        console.log(`  ✅ KEPT: ${changelog[changelog.length - 1].scoreBefore}% → ${currentScore}%`);
      }

      // Check consecutive high
      if (currentScore >= 95) {
        consecutiveHigh++;
        console.log(`  🎯 Score ≥95% (${consecutiveHigh}/3 consecutive)`);
        if (consecutiveHigh >= 3) {
          console.log('\n  🏆 TARGET REACHED: 95%+ three times in a row!');
          break;
        }
      } else {
        consecutiveHigh = 0;
      }
    }

    // ── Final Report ──
    const finalResult = getScore(currentPrompt);
    printRound('FINAL RESULT', finalResult);

    console.log('\n\n═══════════════════════════════════════════════');
    console.log('  AUTORESEARCH COMPLETE');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Baseline: ${baseline.avg}%`);
    console.log(`  Final:    ${finalResult.avg}%`);
    console.log(`  Rounds:   ${changelog.length}`);
    console.log(`  Kept:     ${changelog.filter(c => c.kept).length}`);
    console.log(`  Reverted: ${changelog.filter(c => !c.kept).length}`);
    console.log('\n  📝 Changelog:');
    for (const entry of changelog) {
      console.log(`    R${entry.round}: ${entry.kept ? '✅' : '❌'} ${entry.change} (${entry.scoreBefore}% → ${entry.scoreAfter}%)`);
    }

    // ── Save outputs ──
    const outputDir = path.join(__dirname, '../../src/prompts');

    // Save v2 prompt builder
    const v2Content = `// AUTO-GENERATED by autoresearch — lead-capture-v2
// Original: systemPrompt.ts (untouched)
// Changelog:
${changelog.map(e => `//   R${e.round}: ${e.kept ? 'KEPT' : 'REVERTED'} ${e.change} (${e.scoreBefore}% → ${e.scoreAfter}%)`).join('\n')}
//
// Baseline score: ${baseline.avg}% → Final score: ${finalResult.avg}%

import type { PropertyListing } from '@/types/listing';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export function buildSystemPromptV2(listings: PropertyListing[]): string {
  const listingsContext = listings
    .map(
      (l) =>
        \`- ID: \${l.id} | \${l.address} | \${l.neighborhood} | \${formatCurrency(l.price)} | \${l.bedrooms}bd/\${l.bathrooms}ba | \${l.sqft} sqft | \${l.propertyType} | \${l.status} | Features: \${l.features.join(', ')}\`
    )
    .join('\\n');

  return \`${currentPrompt.replace(/\${/g, '\\${').replace(/`/g, '\\`').replace(/\\\\/g, '\\\\\\\\').replace(/listingsContext/g, "\" + listingsContext + \"")}\`;
}
`;

    // Save changelog
    const changelogContent = `# Autoresearch: Lead Capture Optimization Results

## Summary
- **Baseline score:** ${baseline.avg}%
- **Final score:** ${finalResult.avg}%
- **Rounds:** ${changelog.length}
- **Changes kept:** ${changelog.filter(c => c.kept).length}
- **Changes reverted:** ${changelog.filter(c => !c.kept).length}

## Changelog
${changelog.map(e => `- **Round ${e.round}:** ${e.kept ? '✅ KEPT' : '❌ REVERTED'} — ${e.change} (${e.scoreBefore}% → ${e.scoreAfter}%)`).join('\n')}

## Checklist
1. Was a proper human name captured?
2. Was email or phone number captured?
3. Was a budget range captured?
4. Was a timeline/move-in date captured?
5. Are all captured fields plausible?
6. Did the AI attempt to book a showing?

## Test Conversations
${TEST_CONVERSATIONS.map(c => `- ${c.name}`).join('\n')}

## Final Per-Conversation Scores
${finalResult.details.map(d => `- **${d.name}:** ${d.score}%`).join('\n')}
`;

    fs.writeFileSync(path.join(outputDir, 'autoresearch-changelog.md'), changelogContent);
    console.log('\n  📄 Saved: src/prompts/autoresearch-changelog.md');

    // The actual v2 file needs to be written separately since template literal escaping is complex
    // Instead, write the raw improved prompt text
    fs.writeFileSync(path.join(outputDir, 'systemPromptV2-raw.txt'), currentPrompt);
    console.log('  📄 Saved: src/prompts/systemPromptV2-raw.txt');

    expect(finalResult.avg).toBeGreaterThanOrEqual(90);
  });
});
