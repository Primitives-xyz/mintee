import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpointSecret = "whsec_qX1n35wFgEkj9OrxZl77dBdBpObfzmCl";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const sig = req.headers["stripe-signature"];
  console.log("sig", sig);
  if (!sig) {
    res.status(400).send(`Webhook Error: Signature missing`);
    return;
  }
  let event;

  try {
    console.log("going into try");
    event = stripe.webhooks.constructEvent(req, sig, endpointSecret);

    console.log("event", event);
  } catch (err: any) {
    console.log("ERRROR WHATT", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      console.log(checkoutSessionCompleted);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
}
