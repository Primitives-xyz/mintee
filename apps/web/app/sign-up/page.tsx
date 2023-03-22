import { SignUp } from "@clerk/nextjs/app-beta/client";

export default function Page() {
  return (
    <SignUp
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
      path="/sign-up"
      routing="hash"
      signInUrl="/sign-in"
      redirectUrl="/onboard"
    />
  );
}
