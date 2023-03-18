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

export default async function Page() {
  // Fetch data directly in a Server Component
  const userCreatedNFTs = await getPosts();
  // Forward fetched data to your Client Component

  return (
    <>
      <div className="">
        <h2 className="text-2xl min-w-full shadow-md bg-[#111C27]/75 p-2 rounded-lg">
          Created NFTs
        </h2>
        <div className="flex flex-col">
          <div className=""></div>
          <div className="overflow-auto bg-[#70767d] px-4 py-2 rounded-md mt-2 shadow-xl">
            <DashboardTable userCreatedNFTs={userCreatedNFTs} />
          </div>
        </div>
      </div>
    </>
  );
}
