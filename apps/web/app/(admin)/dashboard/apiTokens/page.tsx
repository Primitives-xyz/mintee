import { auth } from "@clerk/nextjs/app-beta";
import { prismaModels } from "mintee-database";
import { pscale } from "../../../../utils";
import DashboardTable from "../dashboardTable";

async function getUserNFTs() {
  const { userId } = auth();
  const nfts = await pscale.execute(
    `SELECT * FROM NFT WHERE creatorUserExternalId = ?;`,
    [userId]
  );
  return nfts.rows as prismaModels.NFT[] | undefined;
}

export default async function Page() {
  const userCreatedNFTs = await getUserNFTs();
  return (
    <>
      <h2 className="text-2xl min-w-full shadow-md bg-[#111C27]/75 p-2 rounded-lg">
        NFT Info
      </h2>
      {userCreatedNFTs && (
        <div className="overflow-auto bg-[#70767d] px-4 py-2 rounded-md mt-2 shadow-xl">
          <DashboardTable userCreatedNFTs={userCreatedNFTs} />
        </div>
      )}
    </>
  );
}
