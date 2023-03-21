"use client";

import { useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@clerk/nextjs";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);
export default function HeaderCheckout() {
  const { userId } = useAuth();
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
        className="flex max-w-fit items-center justify-center  rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-blue-500 bg-blue-600 font-medium transition"
      >
        Upgrade to Pro
      </button>
      <input type="hidden" name="userId" value={userId as string} />
    </form>
  );
}
