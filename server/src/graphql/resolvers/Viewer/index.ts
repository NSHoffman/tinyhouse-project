import crypto from 'crypto';
import { Response, Request } from 'express';
import { IResolvers } from 'apollo-server-express';
import { Viewer, Database, User } from '../../../lib/types';
import { Google, Stripe } from '../../../lib/api/';
import { LogInArgs, ConnectStripeArgs } from './types';
import { authorize } from '../../../lib/utils';

const cookieOptions = {
  httpOnly: true,
  sameSite: true,
  signed: true,
  secure: process.env.NODE_ENV === 'production',
};

const logInViaCookie = async (token: string, db: Database, req: Request, res: Response):
Promise<User | undefined> =>
{
  const updateRes = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token }},
    { returnOriginal: false }
  );

  const viewer = updateRes.value;
  if (!viewer) res.clearCookie('viewer', cookieOptions);

  return viewer;
}

const logInViaGoogle = async (code: string, token: string, db: Database, res: Response):
Promise<User | undefined> => 
{
  const { user } = await Google.logIn(code);
  if (!user) throw new Error('Unable to retrieve Google user\'s information. Login error!');

  // Name/Photo/Email Lists
  const usernames = user.names?.length ? user.names : null;
  const photos    = user.photos?.length ? user.photos : null;
  const emails    = user.emailAddresses?.length ? user.emailAddresses : null;

  const user_name = usernames ? usernames[0].displayName : null;
  const user_id   = usernames && usernames[0].metadata?.source?.id || null;
  const user_avatar = photos && photos[0].url || null;
  const user_email  = emails && emails[0].value || null;

  if (!user_name || !user_id || !user_avatar || !user_email) throw new Error('Google login error');

  const updateRes = await db.users.findOneAndUpdate({ _id: user_id }, {
    $set: {
      name: user_name,
      avatar: user_avatar,
      contact: user_email,
      token,
    },
  }, { returnOriginal: false });

  let viewer = updateRes.value;
  if (!viewer) 
  {
    const insertResult = await db.users.insertOne({
      _id: user_id,
      token,
      name: user_name,
      contact: user_email,
      avatar: user_avatar,
      income: 0,
      bookings: [],
      listings: [],
    });

    viewer = insertResult.ops[0];
  }

  res.cookie('viewer', user_id, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  return viewer;
}

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      }
      catch (err) {
        throw new Error(`Failed to query Google Auth Url: ${err}`);
      }
    },
  },

  Mutation: {
    logIn: async (_root: undefined, { input }: LogInArgs, { db, req, res }: { db: Database, req: Request, res: Response }):
    Promise<Viewer> => 
    {
      try 
      {
        const code = input?.code;
        const token = crypto.randomBytes(16).toString('hex');

        const viewer: User | undefined = code 
          ? await logInViaGoogle(code, token, db, res) 
          : await logInViaCookie(token, db, req, res);

        if (!viewer) return { didRequest: true };
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      }
      catch (err)
      {
        throw new Error(`Failed to log in: ${err}`);
      }
    },
    logOut: (_root: undefined, _args: Record<string, unknown>, { res }: { res: Response }): Viewer => {
      try {
        res.clearCookie('viewer', cookieOptions);
        return { didRequest: true };
      }
      catch (err) {
        throw new Error(`Failed to log out: ${err}`);
      }
    },

    connectStripe: async (_root: undefined, { input }: ConnectStripeArgs, { db, req }: { db: Database, req: Request }): 
    Promise<Viewer> => 
    {
      try {
        const { code } = input;
        
        let viewer = await authorize(db, req);
        if (!viewer) throw new Error('Stripe login error');

        const wallet = await Stripe.connect(code);
        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: wallet.stripe_user_id }},
          { returnOriginal: false },
        );

        if(!updateRes.value) throw new Error("Failed to update the viewer");
        viewer = updateRes.value;

        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      }

      catch (err) {
        throw new Error("Failed to connect with Stripe");
      }
    },
    disconnectStripe: async (_root: undefined, _args: Record<string, unknown>, { db, req }: { db: Database, req: Request }): 
    Promise<Viewer> => 
    {
      try {
        let viewer = await authorize(db, req);
        if (!viewer) throw new Error("Viewer not found!");

        const updateRes = await db.users.findOneAndUpdate(
          { _id: viewer._id },
          { $set: { walletId: undefined }},
          { returnOriginal: false },
        );
        if (!updateRes.value) throw new Error("Failed to update the viewer");
        viewer = updateRes.value;
        
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      }

      catch (err) {
        throw new Error("Failed to disconnect from Stripe " + err);
      }
    },
  },

  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id,
    hasWallet: (viewer: Viewer): boolean | undefined => viewer.walletId ? true : undefined,
  },
}