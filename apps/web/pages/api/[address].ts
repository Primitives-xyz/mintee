import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";
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
  console.log("url", url);
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

  res.json({ offChain: token.json });
}
