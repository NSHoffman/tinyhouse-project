import { MongoClient } from 'mongodb';
import { Database, Listing, User, Booking } from '../lib/types';

const { env } = process;
const url = `mongodb+srv://${env.DB_USER}:${env.DB_USER_PASSWORD}@${env.DB_CLUSTER}.qkxpp.mongodb.net/${env.DB_DATABASE}?retryWrites=true&w=majority`

export const connectDB = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
  });

  const db = client.db(env.DB_DATABASE);

  return {
    bookings: db.collection<Booking>('bookings'),
    listings: db.collection<Listing>('listings'),
    users: db.collection<User>('users'),    
  };
};