import { config } from 'dotenv';
config({ path: '.env.local' });

import admin from 'firebase-admin';
import { buildVoiceSystemPrompt } from '../prompts/voiceSystemPrompt';
import type { PropertyListing } from '../types/listing';

const VAPI_BASE_URL = 'https://api.vapi.ai';

async function setupVapi() {
  const apiKey = process.env.VAPI_API_KEY;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey) {
    console.error('Missing VAPI_API_KEY. Set it in .env.local');
    process.exit(1);
  }

  // --- Initialize Firebase to fetch listings ---
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials. Set environment variables.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  const db = admin.firestore();

  // --- Fetch active listings for system prompt ---
  console.log('Fetching listings from Firestore...');
  const snapshot = await db
    .collection('listings')
    .where('status', '==', 'active')
    .get();

  const listings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PropertyListing[];

  console.log(`Found ${listings.length} active listings`);

  // --- Build system prompt ---
  const systemPrompt = buildVoiceSystemPrompt(listings);

  // --- Build webhook URL ---
  const siteUrl = process.env.SITE_URL || 'https://your-app.vercel.app';
  const webhookUrl = `${siteUrl}/api/vapi/webhook`;

  // --- Define tools for the assistant ---
  const tools = [
    {
      type: 'function',
      function: {
        name: 'captureLeadInfo',
        description: 'Capture caller contact info and property preferences',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Caller full name' },
            phone: { type: 'string', description: 'Caller phone number' },
            email: { type: 'string', description: 'Caller email address' },
            budgetMin: { type: 'number', description: 'Minimum budget in dollars' },
            budgetMax: { type: 'number', description: 'Maximum budget in dollars' },
            timeline: { type: 'string', description: 'Purchase timeline (e.g. "3 months", "ASAP")' },
            neighborhoods: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preferred Seattle neighborhoods',
            },
            bedrooms: { type: 'number', description: 'Minimum number of bedrooms' },
            propertyType: {
              type: 'string',
              enum: ['single_family', 'condo', 'townhouse'],
              description: 'Preferred property type',
            },
          },
          required: ['name', 'phone'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'suggestProperties',
        description: 'Search for matching properties based on criteria',
        parameters: {
          type: 'object',
          properties: {
            budgetMax: { type: 'number', description: 'Maximum budget in dollars' },
            bedrooms: { type: 'number', description: 'Minimum bedrooms' },
            neighborhoods: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preferred neighborhoods',
            },
            propertyType: {
              type: 'string',
              enum: ['single_family', 'condo', 'townhouse'],
              description: 'Property type filter',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'bookShowing',
        description: 'Book a property showing appointment',
        parameters: {
          type: 'object',
          properties: {
            propertyId: { type: 'string', description: 'Listing ID for the property' },
            preferredDate: { type: 'string', description: 'Preferred date (YYYY-MM-DD)' },
            preferredTime: {
              type: 'string',
              enum: ['morning', 'afternoon', 'evening'],
              description: 'Preferred time of day',
            },
          },
          required: ['propertyId'],
        },
      },
    },
  ];

  // --- Create or update assistant ---
  const assistantPayload = {
    name: 'Skyline Realty Voice Assistant',
    model: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      messages: [{ role: 'system', content: systemPrompt }],
      tools,
    },
    voice: {
      provider: '11labs',
      voiceId: 'sarah', // Professional female voice
    },
    firstMessage:
      'Thank you for calling Skyline Realty! How can I help you today?',
    serverUrl: webhookUrl,
    endCallMessage: 'Thank you for calling Skyline Realty. Have a great day!',
  };

  const existingAssistantId = process.env.VAPI_ASSISTANT_ID;

  let assistantId: string;

  if (existingAssistantId && existingAssistantId !== 'your-assistant-id') {
    // Update existing assistant
    console.log(`Updating assistant ${existingAssistantId}...`);
    const res = await fetch(`${VAPI_BASE_URL}/assistant/${existingAssistantId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantPayload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Failed to update assistant: ${res.status} ${body}`);
      process.exit(1);
    }

    assistantId = existingAssistantId;
    console.log('Assistant updated successfully!');
  } else {
    // Create new assistant
    console.log('Creating new Vapi assistant...');
    const res = await fetch(`${VAPI_BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantPayload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Failed to create assistant: ${res.status} ${body}`);
      process.exit(1);
    }

    const data = (await res.json()) as { id: string };
    assistantId = data.id;
    console.log(`Assistant created with ID: ${assistantId}`);
  }

  // --- Assign phone number if provided ---
  if (phoneNumberId && phoneNumberId !== 'your-phone-number-id') {
    console.log(`Assigning phone number ${phoneNumberId} to assistant...`);
    const res = await fetch(`${VAPI_BASE_URL}/phone-number/${phoneNumberId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assistantId }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`Failed to assign phone number: ${res.status} ${body}`);
      console.warn('You can assign it manually in the Vapi dashboard.');
    } else {
      console.log('Phone number assigned successfully!');
    }
  }

  // --- Output summary ---
  console.log('\n=== Vapi Setup Complete ===');
  console.log(`Assistant ID: ${assistantId}`);
  console.log(`Webhook URL:  ${webhookUrl}`);
  console.log(`Listings:     ${listings.length} active`);
  console.log(`Tools:        captureLeadInfo, suggestProperties, bookShowing`);
  console.log('\nNext steps:');
  console.log(`1. Set VAPI_ASSISTANT_ID=${assistantId} in .env.local`);
  console.log('2. Deploy your app so the webhook URL is live');
  console.log('3. Buy a phone number in Vapi dashboard (if not done)');
  console.log('4. Test by calling the assigned phone number');

  process.exit(0);
}

setupVapi().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
