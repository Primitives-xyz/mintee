import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { WrappedConnection } from "./wrappedConnection";
export function getConnectionWrapper() {
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
  return new WrappedConnection(ownerWallet, connectionString);
}
