require('dotenv').config();

import { connectDB } from '../src/database';
import { listings, users } from '../src/lib/mock';

const seed = async () => {
  try {
    console.log('[seed] : running...');

    const db = await connectDB();

    for (const listing of listings) {
      await db.listings.insertOne(listing);
    }

    for (const user of users) {
      await db.users.insertOne(user);
    }

    console.log('[seed] : done');
  }
  catch {
    throw new Error('Failed to seed database');
  }
};

seed();