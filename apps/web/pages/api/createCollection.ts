import { NextApiRequest, NextApiResponse } from "next";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { WrappedConnection } from "../../utils/wrappedConnection";
import { initCollection } from "../../utils/mint";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env["API_KEY"];
  if (!apiKey) {
    throw new Error("Api key must be provided via API_KEY env var");
  }
  const connectionString = `https://rpc-devnet.helius.xyz?api-key=${apiKey}`;
  const secretKey = process.env["SECRET_KEY"];
  if (!secretKey) {
    throw new Error(
      "Wallet secret key must be provided via SECRET_KEY env var"
    );
  }

  let decodedSecretKey;
  try {
    decodedSecretKey = base58.decode(secretKey);
  } catch {
    throw new Error(
      "Invalid secret key provided. Must be a base 58 encoded string."
    );
  }
  const ownerWallet = Keypair.fromSecretKey(decodedSecretKey);
  const connectionWrapper = new WrappedConnection(
    ownerWallet,
    connectionString
  );
  const {
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  } = await initCollection(
    connectionWrapper,
    {
      name: "Compression Test",
      symbol: "COMP",
      uri: "test123",
    },
    ownerWallet
  );
  return res.json({
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  });
}
