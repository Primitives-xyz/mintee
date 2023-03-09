import base58 from "bs58";
import { WrappedConnection } from "../../utils/wrappedConnection";
import { Keypair } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionWrapper = getConnectionWrapper();

  // grab the assetId from the request
  const { assetId } = req.query;

  const result = await connectionWrapper.getAsset(assetId);
  return res.json(result);
}
