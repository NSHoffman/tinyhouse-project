require('dotenv').config();
import { connectDB } from '../src/database';

const clear = async () => {
  try {
    console.log('[clear] : cleaning...');

    const db = await connectDB();
    const bookings = await db.bookings.find({}).toArray();
    const listings = await db.listings.find({}).toArray();
    const users = await db.users.find({}).toArray();

    if (bookings.length) await db.bookings.drop();
    if (listings.length) await db.listings.drop();
    if (users.length) await db.users.drop();

    console.log('[clear] : done');
  }
  catch {
    throw new Error('Failed to clear database');
  }
}

clear();

