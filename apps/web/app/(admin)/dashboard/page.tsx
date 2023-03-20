import { auth } from "@clerk/nextjs/app-beta";
import { pscale } from "../../../utils";
import type { prismaModels } from "mintee-database";
import DashboardTable from "./dashboardTable";

// revalidate data every second on fetch
export const revalidate = 1;

async function getPosts() {
  const { userId } = auth();

  const sqlQuery = `
  SELECT
    u.externalId as userExternalId,
    u.email as userEmail,
    u.firstName as userFirstName,
    u.lastName as userLastName,
    JSON_ARRAYAGG(JSON_OBJECT(
      'id', n.id,
      'name', n.name,
      'symbol', n.symbol,
      'offChainUrl', n.offChainUrl,
      'description', n.description
    )) as nfts,
    JSON_ARRAYAGG(JSON_OBJECT(
      'id', t.id,
      'type', t.type,
      'valid', t.valid,
      'active', t.active,
      'planType', t.planType,
      'nftInfoCallsCount', t.nftInfoCallsCount,
      'nftInfoCallsLimit', t.nftInfoCallsLimit,
      'canMint', t.canMint,
      'mintCallsCount', t.mintCallsCount,
      'mintCallsLimit', t.mintCallsLimit
    )) as tokens
  FROM User as u
  LEFT JOIN NFT as n ON u.externalId = n.creatorUserExternalId
  LEFT JOIN Token as t ON u.externalId = t.userExternalId
  WHERE u.externalId = ?
  GROUP BY u.externalId, u.email`;

  const result = await pscale.execute(sqlQuery, [userId]);

  return result.rows[0] as prismaModels.User & {
    nfts: prismaModels.NFT[];
    tokens: prismaModels.Token[];
  };
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const userCreatedNFTs = await getPosts();

  // Forward fetched data to your Client Component

  return (
    <>
      <div className="">
        <h2 className="text-2xl min-w-full shadow-md bg-[#111C27]/75 p-2 rounded-lg">
          Mintee Account Overview
        </h2>
        <div className="flex flex-col">
          <div className="flex flex-row space-x-2 m-2 w-full items-center justify-start">
            <div className="h-24 w-42 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">NFT Info Calls</h1>
              <div className="text-4xl">
                {userCreatedNFTs.tokens[0].nftInfoCallsCount}
              </div>
            </div>
            <div className="h-24 w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">NFTs Minted This Month</h1>
              <div className="text-4xl">
                {userCreatedNFTs.tokens[0].mintCallsCount}
              </div>
            </div>
            <div className="h-24 w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text- font-bold mx-2">API Status</h1>
              <div
                className={`text-4xl ${
                  userCreatedNFTs.tokens[0].active
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {userCreatedNFTs.tokens[0].active ? "Active" : "Inactive"}
              </div>
            </div>
            <div className="h-24 w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">Team Tier</h1>
              <div className="text-3xl">
                {userCreatedNFTs.tokens[0].planType}
              </div>
            </div>
          </div>
          <div className="overflow-auto bg-[#70767d] px-4 py-2 rounded-md mt-2 shadow-xl">
            <DashboardTable userCreatedNFTs={userCreatedNFTs.nfts} />
          </div>
        </div>
      </div>
    </>
  );
}
