import { JsonMetadata, Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // parse the query for token address
  const { address } = req.query;
  const tokenPK = new PublicKey(address as string);

  // init metaplex
  if (!tokenPK) return res.status(404).json({ message: "Invalid address" });
  const mp = initMetaplex(res);
  if (!mp)
    return res.status(404).json({ message: "Error connection Solana node" });

  // fetch token
  const token = await mp
    .nfts()
    .findByMint({ mintAddress: tokenPK })
    .catch((e) => {
      console.log("Error", e);
      res.status(404).json({ message: "Error fetching token" + e });
    });

  if (!token) {
    return res.status(404).json({ message: "Token not found" });
  }

  const response: nftResponse = {
    token: {
      name: token.name,
      symbol: token.symbol,
      address: token.address.toBase58(),
      collectionAddress: token.collection?.address.toBase58(),
      uri: token.uri,
      editionNonce: token.editionNonce,
      tokenStandard: token.tokenStandard,
    },
    offChain: token.json,
  };
  return res.status(200).json(response);
}

function initMetaplex(res: NextApiResponse) {
  const url = process.env.rpcUrl;
  if (!url) {
    return res.status(404).json({ message: "Error connection Solana node" });
  }
  const connection = new Connection(url, "confirmed");
  return Metaplex.make(connection);
}

type nftResponse = {
  offChain: JsonMetadata<string> | null;
  token: {
    name: string;
    symbol: string;
    address: string;
    collectionAddress?: string;
    uri: string;
    editionNonce: number | null;
    tokenStandard: TokenStandard | null;
  };
};
