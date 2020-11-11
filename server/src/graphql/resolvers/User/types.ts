import { Booking, Listing } from '../../../lib/types';

export interface UserArgs {
  id: string;
}

export interface UserBookingArgs {
  limit: number;
  bookingsPage: number;
}

export interface UserBookingsData {
  total: number;
  result: Booking[];
}

export interface UserListingArgs {
  limit: number;
  listingsPage: number;
}

export interface UserListingsData {
  total: number;
  result: Listing[];
}

