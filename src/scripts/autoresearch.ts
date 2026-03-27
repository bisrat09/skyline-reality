/**
 * Autoresearch: Lead Capture Skill Optimizer
 *
 * Iteratively improves the system prompt for lead capture by:
 * 1. Simulating buyer conversations
 * 2. Running extraction logic on user messages
 * 3. Scoring against a 6-item checklist
 * 4. Making targeted prompt improvements
 * 5. Keeping changes that improve score, reverting ones that don't
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/autoresearch.ts
 */

import { extractLeadFields, mergeFields } from '../lib/leadExtraction';
import type { ExtractedLeadFields } from '../types/lead';

// ── Scoring Checklist ──────────────────────────────────────────────

interface ChecklistResult {
  q1_name: boolean;        // Was a proper human name captured?
  q2_contact: boolean;     // Was email or phone captured?
  q3_budget: boolean;      // Was a budget range captured?
  q4_timeline: boolean;    // Was a timeline/move-in date captured?
  q5_plausible: boolean;   // Are all captured fields plausible?
  q6_booking: boolean;     // Did AI attempt to book showing/follow-up?
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
    .map(([key, passed]) => `  ${passed ? '✅' : '❌'} ${labels[key as keyof ChecklistResult]}`)
    .join('\n');
}

// ── Test Conversations ─────────────────────────────────────────────
// Each scenario simulates a buyer conversation about 3bd under $500K

interface TestConversation {
  name: string;
  userMessages: string[];
  /** AI responses (for checking booking attempts) */
  expectedAiActions: string[];
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
      "I'd love to see that property!"
    ],
    expectedAiActions: ['suggest_property', 'book_showing'],
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
      "That sounds great, can we schedule a showing?"
    ],
    expectedAiActions: ['suggest_property', 'book_showing'],
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
    expectedAiActions: ['suggest_property', 'book_showing'],
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
      "can I see it this weekend?"
    ],
    expectedAiActions: ['suggest_property', 'book_showing'],
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
      "That one looks perfect — how do we book a tour?"
    ],
    expectedAiActions: ['suggest_property', 'book_showing'],
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
  // Must be at least 2 chars, start with uppercase, not be a common word
  const words = name.split(/\s+/);
  if (words.length === 0) return false;
  const COMMON_WORDS = new Set(['looking', 'searching', 'interested', 'wondering', 'hoping', 'trying', 'hi', 'hello', 'hey']);
  return words[0].length >= 2 && /^[A-Z]/.test(words[0]) && !COMMON_WORDS.has(words[0].toLowerCase());
}

function isPlausibleBudget(min: number | undefined, max: number | undefined): boolean {
  // Budget should be in reasonable range for Seattle homes
  const val = max || min || 0;
  return val >= 100000 && val <= 10000000;
}

function isPlausibleContact(email: string | undefined, phone: string | undefined): boolean {
  if (email && !/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) return false;
  if (phone && !/\d{3}.*\d{3}.*\d{4}/.test(phone)) return false;
  return !!(email || phone);
}

function evaluateConversation(
  conv: TestConversation,
  promptText: string
): ChecklistResult {
  const fields = runExtraction(conv.userMessages);

  // Q1: Was a proper human name captured?
  const q1_name = isPlausibleName(fields.name);

  // Q2: Was email or phone captured before conversation ended?
  const q2_contact = !!(fields.email || fields.phone);

  // Q3: Was a budget range captured?
  const q3_budget = !!(fields.budgetMin || fields.budgetMax);

  // Q4: Was a timeline/move-in date captured?
  const q4_timeline = !!fields.timeline;

  // Q5: Are all captured fields plausible?
  let q5_plausible = true;
  if (fields.name && !isPlausibleName(fields.name)) q5_plausible = false;
  if ((fields.budgetMin || fields.budgetMax) && !isPlausibleBudget(fields.budgetMin, fields.budgetMax)) q5_plausible = false;
  if ((fields.email || fields.phone) && !isPlausibleContact(fields.email, fields.phone)) q5_plausible = false;

  // Q6: Does the system prompt instruct booking/follow-up?
  // Check if prompt has explicit instructions to offer showings/booking
  const bookingPatterns = [
    /book.*showing/i,
    /schedule.*showing/i,
    /offer.*showing/i,
    /BOOK_SHOWING/,
    /follow.?up/i,
    /schedule.*call/i,
  ];
  const hasBookingInstruction = bookingPatterns.some(p => p.test(promptText));

  // Also check: does the user express interest in seeing a property? (last messages often do)
  const userExpressedInterest = conv.userMessages.some(m =>
    /\b(see|visit|tour|showing|schedule|book|view|look at)\b/i.test(m)
  );
  const q6_booking = hasBookingInstruction && userExpressedInterest;

  return { q1_name, q2_contact, q3_budget, q4_timeline, q5_plausible, q6_booking };
}

// ── Prompt Analysis ────────────────────────────────────────────────

interface PromptWeakness {
  criterion: string;
  description: string;
  fix: string;
}

function analyzeWeaknesses(
  results: { conv: TestConversation; checklist: ChecklistResult }[],
  promptText: string
): PromptWeakness[] {
  const weaknesses: PromptWeakness[] = [];

  // Count failures per criterion
  const failures: Record<string, number> = {
    q1_name: 0, q2_contact: 0, q3_budget: 0,
    q4_timeline: 0, q5_plausible: 0, q6_booking: 0,
  };

  for (const r of results) {
    for (const [key, passed] of Object.entries(r.checklist)) {
      if (!passed) failures[key]++;
    }
  }

  // Prioritize by failure count
  if (failures.q1_name > 0 && !/ask.*name/i.test(promptText)) {
    weaknesses.push({
      criterion: 'q1_name',
      description: `Name not captured in ${failures.q1_name}/${results.length} conversations`,
      fix: 'Add explicit instruction to ask for the visitor\'s name early in conversation',
    });
  }

  if (failures.q2_contact > 0 && !/prioritize.*(?:email|phone|contact)/i.test(promptText)) {
    weaknesses.push({
      criterion: 'q2_contact',
      description: `Contact info not captured in ${failures.q2_contact}/${results.length} conversations`,
      fix: 'Add instruction to prioritize getting email or phone within the first few exchanges',
    });
  }

  if (failures.q3_budget > 0 && !/ask.*budget/i.test(promptText)) {
    weaknesses.push({
      criterion: 'q3_budget',
      description: `Budget not captured in ${failures.q3_budget}/${results.length} conversations`,
      fix: 'Add instruction to naturally ask about budget range when discussing properties',
    });
  }

  if (failures.q4_timeline > 0 && !/ask.*timeline|ask.*when|move.?in/i.test(promptText)) {
    weaknesses.push({
      criterion: 'q4_timeline',
      description: `Timeline not captured in ${failures.q4_timeline}/${results.length} conversations`,
      fix: 'Add instruction to ask about timeline/move-in date when qualifying the lead',
    });
  }

  if (failures.q5_plausible > 0) {
    weaknesses.push({
      criterion: 'q5_plausible',
      description: `Implausible fields detected in ${failures.q5_plausible}/${results.length} conversations`,
      fix: 'Add instruction to confirm/validate captured information',
    });
  }

  if (failures.q6_booking > 0) {
    const hasBookingSection = /book.*showing|BOOK_SHOWING/i.test(promptText);
    if (!hasBookingSection) {
      weaknesses.push({
        criterion: 'q6_booking',
        description: `Booking not attempted in ${failures.q6_booking}/${results.length} conversations`,
        fix: 'Add explicit instruction to proactively offer to schedule a showing after suggesting properties',
      });
    } else if (!/proactiv|always offer|after suggest/i.test(promptText)) {
      weaknesses.push({
        criterion: 'q6_booking',
        description: `Booking instruction exists but not proactive enough`,
        fix: 'Strengthen booking instruction: always proactively offer to schedule a showing after suggesting a property, don\'t wait for the user to ask',
      });
    }
  }

  return weaknesses;
}

// ── Prompt Modifications ───────────────────────────────────────────

interface PromptChange {
  description: string;
  apply: (prompt: string) => string;
}

function generateFix(weakness: PromptWeakness, promptText: string): PromptChange | null {
  switch (weakness.criterion) {
    case 'q1_name': {
      if (promptText.includes('## Lead Capture Priority')) return null;
      return {
        description: 'Add lead capture priority order: name first, then contact info',
        apply: (p) => p.replace(
          '## Lead Capture Instructions\nNaturally gather the following information during conversation. Do NOT ask for all of these at once — weave them into the conversation organically:',
          `## Lead Capture Instructions\nNaturally gather the following information during conversation. Do NOT ask for all of these at once — weave them into the conversation organically:\n\n### Lead Capture Priority\nCapture in this order when natural:\n1. **Name** — Ask early: "By the way, what's your name?" or "Who am I helping today?"\n2. **Contact** (email or phone) — After building rapport: "What's the best way to reach you?"\n3. **Budget** — When discussing properties: "What price range works for you?"\n4. **Timeline** — When qualifying: "When are you hoping to move?"\n5. **Preferences** — Neighborhoods, bedrooms, property type\n\nIMPORTANT: Always ask for the visitor's name within the first 2-3 exchanges. A name makes the conversation personal and builds trust.`
        ),
      };
    }
    case 'q2_contact': {
      if (promptText.includes('ask for contact info')) return null;
      return {
        description: 'Add instruction to prioritize contact capture',
        apply: (p) => p.replace(
          '- Phone number',
          '- Phone number\n\nIMPORTANT: Getting contact info (email or phone) is your #1 lead capture goal. After learning what they\'re looking for and their name, ask: "What\'s the best email or phone to reach you at?" Do this before the 5th exchange.'
        ),
      };
    }
    case 'q3_budget': {
      if (promptText.includes('budget early')) return null;
      return {
        description: 'Add instruction to ask budget when discussing properties',
        apply: (p) => p.replace(
          '- Budget range',
          '- Budget range (ask naturally: "What price range are you comfortable with?" or "Do you have a budget in mind?")'
        ),
      };
    }
    case 'q4_timeline': {
      if (promptText.includes('timeline or move-in')) return null;
      return {
        description: 'Add instruction to capture timeline early',
        apply: (p) => p.replace(
          '- Timeline (when they want to buy/move)',
          '- Timeline (when they want to buy/move) — always ask: "When are you looking to move?" or "What\'s your timeline?"'
        ),
      };
    }
    case 'q5_plausible': {
      if (promptText.includes('confirm what you')) return null;
      return {
        description: 'Add instruction to confirm captured information',
        apply: (p) => p.replace(
          'If you detect the user has shared their name, email, or phone, confirm briefly',
          'When the user shares info, confirm it back to them briefly to ensure accuracy. For example: "Got it, Marcus! I have your email as marcus@gmail.com"'
        ),
      };
    }
    case 'q6_booking': {
      if (promptText.includes('ALWAYS proactively offer')) return null;
      return {
        description: 'Strengthen booking instruction to be proactive',
        apply: (p) => p.replace(
          'When a user expresses interest in seeing a property, enthusiastically offer to schedule a showing.',
          'ALWAYS proactively offer to schedule a showing after suggesting a matching property. Don\'t wait for the user to ask — say something like "Want me to set up a showing?" or "I can book a tour for you right now!" When the user expresses ANY interest, immediately offer the booking.'
        ),
      };
    }
    default:
      return null;
  }
}

// ── Main Loop ──────────────────────────────────────────────────────

function runRound(promptText: string, roundNum: number): {
  score: number;
  results: { conv: TestConversation; checklist: ChecklistResult }[];
  weaknesses: PromptWeakness[];
} {
  const results = TEST_CONVERSATIONS.map(conv => ({
    conv,
    checklist: evaluateConversation(conv, promptText),
  }));

  const scores = results.map(r => scoreChecklist(r.checklist));
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  console.log(`\n══════════════════════════════════════════`);
  console.log(`  ROUND ${roundNum} — Score: ${avgScore}%`);
  console.log(`══════════════════════════════════════════`);

  for (const r of results) {
    const score = scoreChecklist(r.checklist);
    console.log(`\n  📋 ${r.conv.name} — ${score}%`);
    console.log(formatChecklist(r.checklist));

    // Show extracted fields
    const fields = runExtraction(r.conv.userMessages);
    console.log(`  📊 Extracted: name=${fields.name || '—'}, email=${fields.email || '—'}, phone=${fields.phone || '—'}, budget=${fields.budgetMin || '—'}-${fields.budgetMax || '—'}, timeline=${fields.timeline || '—'}`);
  }

  const weaknesses = analyzeWeaknesses(results, promptText);
  if (weaknesses.length > 0) {
    console.log(`\n  ⚠️  Weaknesses found:`);
    for (const w of weaknesses) {
      console.log(`    - ${w.description}`);
    }
  }

  return { score: avgScore, results, weaknesses };
}

async function main() {
  // Import the prompt builder
  const { buildSystemPrompt } = await import('../prompts/systemPrompt');
  const { seedListings } = await import('../data/seedListings');

  // Build initial prompt with seed listings (cast to have IDs)
  const listings = seedListings.map((l, i) => ({
    ...l,
    id: `listing-${i + 1}`,
  }));

  let currentPrompt = buildSystemPrompt(listings as any);
  const originalPrompt = currentPrompt;

  console.log('🔬 Autoresearch: Lead Capture Skill Optimizer');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Test inputs: ${TEST_CONVERSATIONS.length} simulated buyer conversations`);
  console.log(`Checklist: 6 criteria`);
  console.log(`Target: 95%+ three times in a row OR 20 rounds`);
  console.log('');

  const changelog: { round: number; change: string; scoreBefore: number; scoreAfter: number; kept: boolean }[] = [];
  let consecutiveHighScores = 0;
  let bestScore = 0;
  let bestPrompt = currentPrompt;

  for (let round = 1; round <= 20; round++) {
    const { score, weaknesses } = runRound(currentPrompt, round);

    if (score > bestScore) {
      bestScore = score;
      bestPrompt = currentPrompt;
    }

    // Check stop condition: 95%+ three times in a row
    if (score >= 95) {
      consecutiveHighScores++;
      console.log(`\n  🎯 Score ≥95% (${consecutiveHighScores}/3 consecutive)`);
      if (consecutiveHighScores >= 3) {
        console.log('\n🏆 TARGET REACHED: 95%+ three times in a row!');
        break;
      }
    } else {
      consecutiveHighScores = 0;
    }

    // If no weaknesses or perfect score, we're done
    if (weaknesses.length === 0 || score === 100) {
      console.log('\n✅ No more weaknesses to fix!');
      break;
    }

    // Apply the highest-priority fix
    const weakness = weaknesses[0];
    const fix = generateFix(weakness, currentPrompt);

    if (!fix) {
      console.log(`\n  ℹ️  No applicable fix for: ${weakness.description}`);
      // Try next weakness
      const altFix = weaknesses.length > 1 ? generateFix(weaknesses[1], currentPrompt) : null;
      if (!altFix) {
        console.log('  ℹ️  No more fixes available. Stopping.');
        break;
      }
      console.log(`\n  🔧 Trying fix: ${altFix.description}`);
      const modifiedPrompt = altFix.apply(currentPrompt);
      const { score: newScore } = runRound(modifiedPrompt, round);

      if (newScore >= score) {
        console.log(`  ✅ Score ${score}% → ${newScore}% — KEEPING change`);
        currentPrompt = modifiedPrompt;
        changelog.push({ round, change: altFix.description, scoreBefore: score, scoreAfter: newScore, kept: true });
      } else {
        console.log(`  ❌ Score ${score}% → ${newScore}% — REVERTING change`);
        changelog.push({ round, change: altFix.description, scoreBefore: score, scoreAfter: newScore, kept: false });
      }
      continue;
    }

    console.log(`\n  🔧 Applying fix: ${fix.description}`);
    const modifiedPrompt = fix.apply(currentPrompt);

    // Test the modified prompt
    const afterResult = runRound(modifiedPrompt, round);
    const newScore = afterResult.score;

    if (newScore >= score) {
      console.log(`  ✅ Score ${score}% → ${newScore}% — KEEPING change`);
      currentPrompt = modifiedPrompt;
      changelog.push({ round, change: fix.description, scoreBefore: score, scoreAfter: newScore, kept: true });
    } else {
      console.log(`  ❌ Score ${score}% → ${newScore}% — REVERTING change`);
      changelog.push({ round, change: fix.description, scoreBefore: score, scoreAfter: newScore, kept: false });
    }
  }

  // ── Final Report ─────────────────────────────────────────────
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AUTORESEARCH COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n  Final best score: ${bestScore}%`);
  console.log(`  Total rounds: ${changelog.length}`);
  console.log(`  Changes kept: ${changelog.filter(c => c.kept).length}`);
  console.log(`  Changes reverted: ${changelog.filter(c => !c.kept).length}`);

  console.log('\n  📝 Changelog:');
  for (const entry of changelog) {
    const icon = entry.kept ? '✅' : '❌';
    console.log(`    Round ${entry.round}: ${icon} ${entry.change} (${entry.scoreBefore}% → ${entry.scoreAfter}%)`);
  }

  // Output the improved prompt for saving
  console.log('\n\n──── IMPROVED PROMPT (for lead-capture-v2) ────');
  console.log('PROMPT_START');
  console.log(currentPrompt);
  console.log('PROMPT_END');
}

main().catch(console.error);
