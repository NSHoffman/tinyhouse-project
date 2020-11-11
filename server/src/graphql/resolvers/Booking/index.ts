import { IResolvers } from 'apollo-server-express';
import { Request } from 'express';
import { Booking, Database, Listing, BookingsIndex } from '../../../lib/types';
import { Maybe } from 'graphql/jsutils/Maybe';
import { CreateBookingArgs } from './types';
import { authorize } from '../../../lib/utils';
import { ObjectId } from 'mongodb';
import { Stripe } from '../../../lib/api';


const resolveBookingsIndex = (bookingsIndex: BookingsIndex, checkIn: string, checkOut: string):
BookingsIndex => {
  let dateCursor = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const newBookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOutDate) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth() + 1;
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }
    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }
    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    }
    else throw new Error("Selected date range cannot include dates that have already been booked by someone!");

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
}

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (_root: undefined, { input }: CreateBookingArgs, { db, req }: { db: Database, req: Request }):
    Promise<Booking> => 
    {
      try {
        const { id, source, checkIn, checkOut } = input;
        
        const viewer = await authorize(db, req);
        if (!viewer) throw new Error("Viewer cannot be found!");

        const listing = await db.listings.findOne({
          _id: new ObjectId(id),
        });
        if (!listing) throw new Error("Listing cannot be found!");
        if (listing.host === viewer._id) throw new Error("Viewer cannot book their own listings!");


        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkInDate > checkOutDate) throw new Error("Check-in date cannot be after check-out date!");

        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut
        );

        const totalPrice = listing.price * 
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        const host = await db.users.findOne({
          _id: listing.host,
        });

        if (!host || !host.walletId) {
          throw new Error("The host either cannot be found or is not connected with Stripe!");
        }

        await Stripe.charge(totalPrice, source, host.walletId);

        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        });
        const insertedBooking = insertRes.ops[0];

        await db.users.updateOne(
          { _id: host._id },
          { $inc: { income: totalPrice }}        
        );

        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id }}
        );

        await db.listings.updateOne(
          { _id: listing._id },
          { $set: { bookingsIndex }, $push: { bookings: insertedBooking._id }}
        );

        return insertedBooking;
      }

      catch {
        throw new Error("Failed to create a booking!");
      }
    },
  },

  Booking: {
    id: (booking: Booking): string => booking._id.toString(),
    listing: (booking: Booking, _args, { db }: { db: Database }):
      Promise<Maybe<Listing>> => db.listings.findOne({ _id: booking.listing }),
    tenant: (booking: Booking, _args: Record<string, unknown>, { db }: { db: Database }) => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};