import { auth } from "@clerk/nextjs/app-beta";
import { Suspense } from "react";
import { pscale } from "../../../utils";
import Loading from "./loading";
import type { prismaModels } from "mintee-database";

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
      <Suspense fallback={<Loading />}>
        {userCreatedNFTs.map((nft) => (
          <div key={nft.id} />
        ))}
      </Suspense>
    </>
  );
}
