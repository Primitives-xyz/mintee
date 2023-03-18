import { auth } from "@clerk/nextjs/app-beta";
import { pscale } from "../../../utils";
import type { prismaModels } from "mintee-database";
import DashboardTable from "./dashboardTable";
export const revalidate = 1;

async function getPosts() {
  const { userId } = auth();

  const NFTs = await pscale.execute(
    "SELECT * FROM NFT WHERE creatorUserExternalId = ?",
    [userId]
  );
  return NFTs.rows as prismaModels.NFT[];
}

async function getCollections(userId: string) {
  const collections = await pscale.execute(
    "SELECT * FROM NFT WHERE creatorUserExternalId AND isCollection = ?",
    [userId, true]
  );
  return collections.rows as prismaModels.NFT[];
}

export default async function Page() {
  const { userId } = auth();
  if (!userId) return null;
  // Fetch data directly in a Server Component
  const userCreatedNFTsPromise = getPosts();
  const userCreatedCollectionsPromise = getCollections(userId);
  const [userCreatedNFTs, userCreatedCollections] = await Promise.all([
    userCreatedNFTsPromise,
    userCreatedCollectionsPromise,
  ]);
  // Forward fetched data to your Client Component

  return (
    <>
      <div className="">
        <h2 className="text-2xl min-w-full shadow-md bg-white/25 p-2  rounded-lg">
          Created NFTs
        </h2>
        <div className="flex flex-col">
          <div className="w-full flex flex-row space-x-2 px-2 mt-2">
            <div className="w-1/2 bg-violet-600/50 rounded-xl flex flex-col">
              <div className="w-full text-center m-2 text-xl h-32 ">
                NFTS Minted This Month
              </div>
              <div className="w-full text-center items-center h-full text-4xl">
                {userCreatedNFTs.length}
              </div>
            </div>
            <div className="w-1/2 bg-pink-500/50 rounded-xl flex flex-col">
              <div className="w-full text-center m-2 text-xl h-32">
                Collections Minted This Month
              </div>
              <div className="w-full text-center items-center h-full text-4xl">
                {userCreatedCollections.length}
              </div>
            </div>
          </div>
          <div className="overflow-auto bg-[#70767d] mx-2 px-2   py-2 rounded-md mt-2 shadow-xl">
            <h2 className="text-center w-full text-2xl underline underline-offset-2 mb-2">
              All NFTs Minted
            </h2>
            <DashboardTable userCreatedNFTs={userCreatedNFTs} />
          </div>
          <div className="overflow-auto bg-[#70767d] mx-2 px-2   py-2 rounded-md mt-2 shadow-xl">
            <h2 className="text-center w-full text-2xl underline underline-offset-2 mb-2">
              All Collections Minted
            </h2>
            <DashboardTable userCreatedNFTs={userCreatedCollections} />
          </div>
        </div>
      </div>
    </>
  );
}
