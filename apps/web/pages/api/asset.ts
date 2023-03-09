import { NextApiRequest, NextApiResponse } from "next";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionWrapper = getConnectionWrapper();

  // grab the assetId from the request
  const { assetId } = req.query;

  const result = await connectionWrapper.getAsset(assetId).catch((e) => {
    console.error(e);
    return res.status(500).json({ error: e.message });
  });
  console.log("IDKKK", result);
  if (!result) {
    return res.status(500).json({ error: "Failed to get asset" });
  }
  return res.json(result);
}
