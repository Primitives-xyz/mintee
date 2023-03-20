"use client";

import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@clerk/nextjs";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);
export default function StripeCheckout() {
  const { userId } = useAuth();
  console.log("USERRRID", userId);
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);

  return (
    <form action="/api/checkout" method="POST">
      <button
        type="submit"
        role="link"
        className="flex w-48 text-lg mt-4 items-center justify-center  rounded-full border hover:text-yellow-300 border-blue-600 text-white px-5 py-2  shadow-md  bg-blue-600 font-medium transition"
      >
        Upgrade to Pro
      </button>
      <input type="hidden" name="userId" value={userId as string} />
    </form>
  );
}
