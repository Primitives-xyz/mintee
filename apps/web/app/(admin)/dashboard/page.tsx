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
    (SELECT JSON_ARRAYAGG(JSON_OBJECT(
      'id', n2.id,
      'name', n2.name,
      'symbol', n2.symbol,
      'uri', n2.uri,
      'description', n2.description,
      'blockchainAddress', n2.blockchainAddress,
      'blockchainAddress', n2.blockchainAddress,
      'creatorUserExternalId', n2.creatorUserExternalId
    )) FROM (SELECT DISTINCT id, name, symbol, uri, description, blockchainAddress, creatorUserExternalId FROM NFT WHERE creatorUserExternalId = ?) as n2) as nfts,
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
  INNER JOIN NFT as n ON u.externalId = n.creatorUserExternalId
  LEFT JOIN Token as t ON u.externalId = t.userExternalId
  WHERE u.externalId = ?
  GROUP BY u.externalId, u.email`;

  const result = await pscale.execute(sqlQuery, [userId, userId]);

  return result.rows[0] as prismaModels.User & {
    nfts: prismaModels.NFT[];
    tokens: prismaModels.Token[];
  };
}

export default async function Page() {
  // Fetch data directly in a Server Component
  const userCreatedNFTs = await getPosts();

  // Forward fetched data to your Client Component
  console.log(userCreatedNFTs);
  return (
    <>
      <div className="">
        <h2 className="text-2xl min-w-full shadow-md bg-[#111C27]/75 p-2 rounded-lg">
          Mintee Account Overview
        </h2>
        <div className="flex flex-col overflow-auto">
          <div className="flex flex-col sm:flex-row sm:space-x-2 p-2 w-full items-center justify-center sm:justify-start space-y-2 sm:space-y-0">
            <div className="h-24 w-full sm:w-48 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">NFT Info Calls</h1>
              <div className="text-4xl">
                {userCreatedNFTs?.tokens[0].nftInfoCallsCount ?? 0}
              </div>
            </div>
            <div className="h-24 w-full sm:w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">NFTs Minted This Month</h1>
              <div className="text-4xl">
                {userCreatedNFTs?.tokens[0].mintCallsCount ?? 0}
              </div>
            </div>
            <div className="h-24 w-full sm:w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text- font-bold mx-2">API Status</h1>
              <div
                className={`text-4xl ${
                  userCreatedNFTs?.tokens[0].active
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {userCreatedNFTs?.tokens[0].active ? "Active" : "Inactive"}
              </div>
            </div>
            <div className="h-24 w-full sm:w-64 rounded-md bg-slate-700 flex justify-center  items-center flex-col">
              <h1 className="text-md font-bold mx-2">Team Tier</h1>
              <div className="text-3xl">
                {userCreatedNFTs?.tokens[0].planType ?? "Free"}
              </div>
            </div>
          </div>
          {userCreatedNFTs?.nfts && (
            <div className="overflow-auto bg-[#70767d] px-4 py-2 rounded-md mt-2 shadow-xl">
              <DashboardTable userCreatedNFTs={userCreatedNFTs.nfts} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
