import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get search params
  const { address } = req.query;
  if (!address || address === "" || typeof address !== "string")
    return res.status(404).json({ message: "Invalid token address" });

  // check if valid PublicKey
  let tokenPK = {} as PublicKey;
  try {
    tokenPK = new PublicKey(address);
  } catch (error) {
    return res.status(404).json({ message: "Invalid token address" });
  }
  if (!tokenPK)
    return res.status(404).json({ message: "Invalid token address" });
  const url = process.env.RPC_URl;
  if (!url) {
    return res.status(404).json({ message: "Error connection Solana node" });
  }

  // grab token data from onchain and load json
  const connection = new Connection(url);
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
  return res.status(200).json(token);
}
