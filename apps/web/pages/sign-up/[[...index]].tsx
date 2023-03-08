import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-20 sm:px-6 lg:px-8">
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      redirectUrl="/onboard"
    />
  </div>
);

export default SignUpPage;
