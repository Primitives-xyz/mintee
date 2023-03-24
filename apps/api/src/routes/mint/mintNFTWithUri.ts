import { Env } from "../../utils";
import { mintCollectionNFT } from "./mintCollection";
import { mintCompressedNFT } from "./mintCompressed";

export async function mintNFTWithUri(
  externalUserId: string,
  mintInfoData: {
    data: any;
    options: any;
  },
  ctx: ExecutionContext,
  env: Env
) {
  if (mintInfoData.data?.isCollection) {
    return await mintCollectionNFT({ externalUserId, mintInfoData, env, ctx });
  } else {
    return await mintCompressedNFT({ externalUserId, mintInfoData, env, ctx });
  }
}
