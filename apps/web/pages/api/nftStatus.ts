import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";
const url = process.env.rpcUrl;
const connection = new Connection(
  url ?? "https://api.mainnet-beta.solana.com",
  "confirmed"
);
const mp = Metaplex.make(connection);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get search params
  const { address } = req.query;

  console.log("req log!", req);

  const tokenPK = new PublicKey(address as string);
  if (!tokenPK) return res.status(404).json({ message: "Invalid address" });
  if (!url) {
    return res.status(404).json({ message: "Error connection Solana node" });
  }
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
