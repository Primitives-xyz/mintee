import {
  isNft,
  JsonMetadata,
  Metaplex,
  PublicKey,
} from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  const tokenPK = new PublicKey(address as string);
  if (!tokenPK) return res.status(404).json({ message: "Invalid address" });
  const url = process.env.rpcUrl;
  if (!url) {
    return res.status(404).json({ message: "Error connection Solana node" });
  }
  const connection = new Connection(url, "confirmed");
  const mp = Metaplex.make(connection);
  const token = await mp
    .nfts()
    .findByMint({ mintAddress: tokenPK })
    .catch((e) => {
      console.log("Error", e);
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
