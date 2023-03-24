import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
import { keypairIdentity, Metaplex, PublicKey } from "@metaplex-foundation/js";
import { minteeCollection } from "mintee-utils/dist/zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // check header for key cloudflare-worker-key
  const key = req.headers["cloudflare-worker-key"];
  if (!key || key != process.env["WORKER_KEY"]) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const body = req.body as minteeCollection;
  const connectionWrapper = getConnectionWrapper();
  const mp = Metaplex.make(connectionWrapper);
  mp.use(keypairIdentity(connectionWrapper.payer));
  const nftTx = await mp
    .nfts()
    .builders()
    .create({
      name: body.name,
      symbol: body.symbol,
      uri: body.uri,
      sellerFeeBasisPoints: body.sellerFeeBasisPoints ?? 0,
      isCollection: true,
      creators: body.creators?.map((c) => ({
        address: new PublicKey(c.address),
        verified: c.verified,
        share: c.share,
      })),
      isMutable: body.isMutable,
    });
  const { mintAddress } = nftTx.getContext();
  await mp.rpc().sendAndConfirmTransaction(nftTx, {
    commitment: "finalized",
  });

  return res.json({
    collectionMint: mintAddress,
  });
}
