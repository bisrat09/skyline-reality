import { config } from 'dotenv';
config({ path: '.env.local' });

import admin from 'firebase-admin';
import { seedListings } from '../data/seedListings';

async function seed() {
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
  const batch = db.batch();

  console.log(`Seeding ${seedListings.length} listings...`);

  for (const listing of seedListings) {
    const docRef = db.collection('listings').doc();
    batch.set(docRef, listing);
    console.log(`  + ${listing.address}`);
  }

  await batch.commit();
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
