"use client";
import { SignIn } from "@clerk/nextjs/app-beta/client";

export default function Page() {
  return (
    <SignIn
      path="/sign-in"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboard"
      routing="hash"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          rootBox: {
            backgroundColor: "#111C27",
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            margin: "0",
          },
        },
      }}
    />
  );
}
