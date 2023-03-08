import { useAuth } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/api";
import { buildClerkProps, clerkClient, getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import { Testimonials } from "../components/Testimonials";
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  return { props: { userId } };
};
export default function Page(props: { userId: string }) {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Mintee</title>
      </Head>

      <Header userId={props.userId} />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-10 mt-10 background-gradient">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="border border-gray-700 rounded-lg py-2 px-4 text-gray-400 text-sm mb-5 transition duration-300 ease-in-out hover:text-gray-300"
        >
          Get 25 free mints a month{"  "}
          <span className="text-blue-600">using our API</span>
        </a>
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-300 sm:text-7xl">
          Minting as a service,
          <span className="relative whitespace-nowrap text-yellow-300">
            <SquigglyLines />
            <span className="relative">at the speed of light.</span>
          </span>
        </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg sm:text-gray-400  text-gray-500 leading-7">
          Thousands of NFTs a month, minted directly into users wallets, as fast
          as possible.
        </h2>
        <div className="flex sm:flex-row flex-col  mt-6 justify-center space-x-4">
          {!props.userId && (
            <Link
              className="bg-blue-500 rounded-xl text-white font-medium w-52 px-4 py-3 sm:mt-10 mt-8 w-54 hover:bg-blue-400 transition"
              href="/"
            >
              Create a free account
            </Link>
          )}

          <Link
            className="bg-gray-500 rounded-xl text-white font-medium px-4 py-3 sm:mt-10 mt-8 w-52  hover:bg-gray-400 transition"
            href="/"
          >
            Read our docs
          </Link>
        </div>
        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-4 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col w-full">
              <div className="w-1/2">
                <h3 className="mb-1 font-medium text-lg">Easy to use API</h3>
                <Image
                  alt="Original photo of a room with roomGPT.io"
                  src="/carbon.png"
                  className="w-full object-cover h-96 rounded-2xl"
                  width={400}
                  height={400}
                />
              </div>
              <div className="sm:mt-0 mt-8 w-1/2">
                <h3 className="mb-1 font-medium text-lg">
                  Globally Distrubuted Mint Nodes
                </h3>
                <Image
                  alt="Generated photo of a room with roomGPT.io"
                  width={400}
                  height={400}
                  src="/cf.png"
                  className="w-full object-cover h-96 rounded-2xl sm:mt-0 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Testimonials />
      <Footer />
    </div>
  );
}
