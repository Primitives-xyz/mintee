import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
import { initTree } from "../../utils/mint";
import { WrappedConnection } from "../../utils/wrappedConnection";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionWrapper = getConnectionWrapper();
  // Fixed wallet to manage the merkle tree used to store the collection.
  const treeWallet = Keypair.generate();
  const treeAddress = await initTree(
    connectionWrapper,
    connectionWrapper.payer,
    treeWallet
  );
  return res.json({
    treeAddress: treeAddress,
    treeWalletSK: base58.encode(treeWallet.secretKey),
  });
}
