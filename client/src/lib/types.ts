export type Maybe<T> = T | null;

export interface Viewer {
  id        : Maybe<string>;
  token     : Maybe<string>;
  avatar    : Maybe<string>;
  hasWallet : Maybe<boolean>;
  didRequest: boolean;
}

export interface Listing {
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
}