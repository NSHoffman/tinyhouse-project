import { IResolvers } from "apollo-server-express";
import { Request } from 'express';
import { authorize } from '../../../lib/utils';
import { UserArgs, UserBookingArgs, UserBookingsData, UserListingArgs, UserListingsData } from './types';
import { Database, User, Maybe } from '../../../lib/types';

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined, 
      { id }: UserArgs, 
      { db, req }: { db: Database, req: Request }
    ): 
    Promise<User> => 
    {
      try {
        const user = await db.users.findOne({ _id: id });
        if (!user) throw new Error('No users with the given ID have been found!');

        const viewer = await authorize(db, req);
        if (viewer?._id === user._id) user.authorized = true;

        return user;
      }
      catch (err) {
        throw new Error(`Failed to query user: ${err}`);
      }
    }
  },

  User: {
    id: (user: User): string => user._id,
    hasWallet: (user: User): boolean => !!user.walletId,
    income: (user: User): Maybe<number> => user.authorized ? user.income : null,
    bookings: async (user: User, { limit, bookingsPage: page }: UserBookingArgs, { db }: { db: Database }):
      Promise<Maybe<UserBookingsData>> => 
      {
        try {
          if (!user.authorized) return null;

          const data: UserBookingsData = {
            total: 0,
            result: [],
          };

          let cursor = await db.bookings.find({
            _id: { $in: user.bookings }
          });

          cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);
          
          data.total = await cursor.count();
          data.result = await cursor.toArray();

          return data;
        }

        catch (err) {
          throw new Error(`Failed to query user bookings: ${err}`);
        }
      },

    listings: async (user: User, { limit, listingsPage: page }: UserListingArgs, { db }: { db: Database }):
      Promise<Maybe<UserListingsData>> => 
      {
        try {
          const data: UserListingsData = {
            total: 0,
            result: [],
          };

          let cursor = await db.listings.find({
            _id: { $in: user.listings }
          });

          cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);
          
          data.total = await cursor.count();
          data.result = await cursor.toArray();

          return data;
        }

        catch (err) {
          throw new Error(`Failed to query user listings: ${err}`);
        }
      },
  }
}