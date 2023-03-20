import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      console.log("req.body", req);
      const body = req.body;
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: "price_1MnohIBmA1eN5ps6P3X1rKmV",
            quantity: 1,
          },
        ],
        mode: "subscription",

        success_url: `${req.headers.origin}/upgrade?success=true&userId=${body.userId}`,
        cancel_url: `${req.headers.origin}/onboard?canceled=true`,
      });
      res.redirect(303, session.url!);
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
