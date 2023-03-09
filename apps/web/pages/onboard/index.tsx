import { getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps } from "next";
import { checkEnvironment } from "../../utils/api-helpers";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  const url = checkEnvironment() + "/api/onboard";
  const res = await fetch(url);
  return { props: { userId } };
};

export default function Onboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-20 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Onboard</h1>
    </div>
  );
}
