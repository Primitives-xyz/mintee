import { auth } from "@clerk/nextjs/app-beta";
import Link from "next/link";
import Image from "next/image";
import SquigglyLines from "../../components/SquigglyLines";

export default async function Page() {
  // Fetch data directly in a Server Component
  // Forward fetched data to your Client Component
  const { userId } = auth();
  return (
    <>
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
        <h1 className="mx-auto max-w-4xl font-display sm:text-5xl font-bold tracking-normal text-gray-300 text-3xl">
          Minting as a service,
          <span className="relative whitespace-nowrap text-yellow-300">
            <SquigglyLines />
            <br className="visible md:hidden" />
            <span className="relative">at the speed of light.</span>
          </span>
        </h1>
        <h2 className="mx-auto mt-6 md:mt-12 max-w-lg text-lg sm:text-gray-400  text-gray-500 leading-7">
          Thousands of NFTs a month, minted directly into users wallets, as fast
          as possible.
        </h2>
        <div className="flex sm:flex-row flex-col  mt-6 justify-center items-center sm:space-x-4">
          {!userId && (
            <Link
              className="bg-blue-500 rounded-xl text-white font-medium w-52 px-4 py-3 sm:mt-10 mt-8  hover:bg-blue-400 transition"
              href="/sign-up"
            >
              Create a free account
            </Link>
          )}

          <Link
            className="bg-gray-500 rounded-xl text-white font-medium   w-52 px-4 py-3 sm:mt-10 mt-8 hover:bg-gray-400 transition"
            href="https://docs.mintee.io"
          >
            Read our docs
          </Link>
        </div>
        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-4 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col w-full">
              <div className="sm:w-1/2">
                <h3 className="mb-1 font-medium text-lg">Easy to use API</h3>
                <Image
                  alt="Original photo of a room with roomGPT.io"
                  src="/img/carbon.png"
                  className="w-full object-cover h-96 rounded-2xl"
                  width={400}
                  height={400}
                />
              </div>
              <div className="sm:mt-0 mt-8 sm:w-1/2">
                <h3 className="mb-1 font-medium text-lg">
                  Globally Distrubuted Mint Nodes
                </h3>

                <Image
                  alt="Generated photo of a room with roomGPT.io"
                  width={400}
                  height={400}
                  src="/img/cf.png"
                  className="w-full object-cover h-96 rounded-2xl sm:mt-0 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-96 bg-[#47586a]/75 rounded-2xl mt-4 ">
          <h2 className="text-4xl mt-4"> Pricing</h2>
          <div className="flex flex-row w-full mt-4">
            <div className="flex flex-col w-1/3 h-48">
              <div className=" text-2xl ">Free</div>
            </div>
            <div className="flex flex-col w-1/3 text-2xl">$20/Month</div>
            <div className="flex flex-col w-1/3 text-2xl">$100/month</div>
          </div>
        </div>
      </main>
    </>
  );
}
