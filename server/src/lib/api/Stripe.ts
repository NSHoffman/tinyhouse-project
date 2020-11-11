import stripe, { } from 'stripe';

const { env } = process;
const client = new stripe(`${env.S_SECRET_KEY}`, {
  apiVersion: '2020-08-27'
});

export const Stripe = {
  connect: async (code: string) => {
    try {
      const response = await client.oauth.token({
        code,
        grant_type: 'authorization_code',
      });

      return response;
    }
    catch (err) {
      throw new Error("Failed to connect with Stripe");
    }
  },

  charge: async (amount: number, source: string, stripeAccount: string) => {
    const res = await client.charges.create({
      amount,
      currency: "usd",
      source,
      application_fee_amount: Math.round(amount * 0.05),
    }, { stripeAccount });

    if (res.status !== "succeeded") {
      throw new Error("Failed to create charge with Stripe");
    }

    
  },
}