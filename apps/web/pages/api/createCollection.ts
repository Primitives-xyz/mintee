import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionWrapper = getConnectionWrapper();

  const mp = Metaplex.make(connectionWrapper);
  mp.use(keypairIdentity(connectionWrapper.payer));
  const nftTx = await mp.nfts().builders().create({
    name: "Compression Test",
    symbol: "COMP",
    uri: "test123",
    sellerFeeBasisPoints: 0,
    isCollection: true,
  });
  const { mintAddress } = nftTx.getContext();
  await mp.rpc().sendAndConfirmTransaction(nftTx, {
    commitment: "finalized",
  });
  await sleep(1000);
  const collection = await mp.nfts().findByMint(
    { mintAddress },
    {
      commitment: "finalized",
    }
  );
  return res.json({
    collectionMint: collection.mint.address.toString(),
    collectionMetadataAccount: collection.metadataAddress.toString(),
    collectionMasterEditionAccount: collection.address.toString(),
  });
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
