import { IResolvers } from 'apollo-server-express';
import { Request } from 'express';
import { Database, Listing, User, Maybe, ListingType } from '../../../lib/types';
import { authorize } from '../../../lib/utils';
import { 
  ListingArgs, 
  ListingBookingsArgs, 
  ListingBookingsData, 
  ListingsData, 
  ListingsArgs, 
  ListingsFilter, 
  ListingsQuery,
  HostListingArgs, 
  HostListingInput
} from './types';  
import { ObjectId } from 'mongodb';
import { Cloudinary, Google } from '../../../lib/api';

const verifyHostListingInput = ({ title, description, price, type }: HostListingInput) => 
{
  if (title.length > 100) 
    throw new Error("Listing title mustn't exceed the length of 100 characters!");
  if (description.length > 5000) 
    throw new Error("Listing description mustn't exceed the length of 5000 characters!");
  if (type !== ListingType.Apartment && type !== ListingType.House)
    throw new Error("Listing type must be either Apartment or House");
  if (price < 0)
    throw new Error("Listing price must be greater than 0!");
}


export const listingResolvers: IResolvers = {
  Query: {
    listing: async (_root: undefined, { id }: ListingArgs, { db, req }: { db: Database, req: Request }):
      Promise<Listing> => 
      {
        try {
          const listing = await db.listings.findOne({ _id: new ObjectId(id) });        
          if (!listing) throw new Error("Listing can't be found!");

          const viewer = await authorize(db, req);
          if (viewer?._id === listing.host) {
            listing.authorized = true;
          }

          return listing;
        }

        catch (err) {
          throw new Error(`Something went wrong during listing search!: ${err}`);
        }
      },
    
    listings: async (_root: undefined, { location, filter, limit, page }: ListingsArgs, { db }: { db: Database, req: Request }):
      Promise<ListingsData> => {
        try 
        {
          const query: ListingsQuery = {};
          const data: ListingsData = {
            region: null,
            total: 0,
            result: [],
          };

          if (location) {
            const {country, admin, city} = await Google.geocode(location);
            const regionArray = [];

            if (city) {
              query.city = city;
              regionArray.push(city);
            }
            if (admin) {
              query.admin = admin;
              regionArray.push(admin);
            }

            if (country) {
              query.country = country;
              regionArray.push(country);
            }
            else {
              throw new Error("Requested country not found!");
            }

            if (regionArray.length) data.region = regionArray.join(", ");
          }

          let cursor = await db.listings.find(query);

          // Checking for the presense of filters stated in the request
          // Applying filters if necessary
          switch (filter) 
          {
            case ListingsFilter.PRICE_LOW_TO_HIGH:
              cursor.sort({ price: 1 });
              break;

            case ListingsFilter.PRICE_HIGH_TO_LOW:
              cursor.sort({ price: -1 });
              break;
          }

          cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);
          
          data.total = await cursor.count();
          data.result = await cursor.toArray();

          return data;
        }

        catch (err) {
          throw new Error(`Failed to query listings: ${err}`);
        }
      },
  },

  Mutation: {
    hostListing: async (_root: undefined, { input }: HostListingArgs, { db, req }: { db: Database, req: Request }):
      Promise<Listing> => 
      {
        verifyHostListingInput(input);

        const viewer = await authorize(db, req);
        if (!viewer) throw new Error("viewer cannot be found");

        const { country, admin, city } = await Google.geocode(input.address);
        if (!country || !admin || !city) throw new Error("Invalid address input!");

        const imageUrl = await Cloudinary.upload(input.image);

        const insertResult = await db.listings.insertOne({
          _id: new ObjectId(),
          ...input,
          image: imageUrl,
          bookings: [],
          bookingsIndex: {},
          country,
          admin,
          city,
          host: viewer._id,
        });

        const insertedListing: Listing = insertResult.ops[0];

        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { listings: insertedListing._id }}
        );

        return insertedListing;
      },
  },

  Listing: {
    id: (listing: Listing): string => listing._id.toString(),

    host: async (listing: Listing, _args: Record<string, unknown>, { db }: { db: Database }):
      Promise<User> =>
      {
        try {
          const host = await db.users.findOne({ _id: listing.host });
          if (!host) throw new Error("Can't retrieve the user!");

          return host;
        }

        catch (err) {
          throw new Error(`Error occurred while retrieving the user: ${err}`);
        }
      },

    bookingsIndex: (listing: Listing): string =>
    {
      return JSON.stringify(listing.bookingsIndex);   
    },

    bookings: async (listing: Listing, { limit, page }: ListingBookingsArgs, { db }: { db: Database }):
      Promise<Maybe<ListingBookingsData>> => 
      {
        try {
          if (!listing.authorized) return null;

          const data: ListingBookingsData = {
            total: 0,
            result: [],
          };

          let cursor = await db.bookings.find({
            _id: { $in: listing.bookings }
          });

          cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0).limit(limit);
          
          data.total = await cursor.count();
          data.result = await cursor.toArray();

          return data;
        }

        catch (err) {
          throw new Error(`Failed to query listing bookings: ${err}`);
        }
      },
  }
};