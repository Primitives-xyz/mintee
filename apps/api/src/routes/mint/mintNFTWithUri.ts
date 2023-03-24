import { apiTokenStatus } from "../../auth";
import { corsHeaders, Env } from "../../utils";
import { mintCollectionNFT } from "./mintCollection";
import { mintCompressedNFT } from "./mintCompressed";

export async function mintNFTWithUri(
  apiToken: apiTokenStatus,
  mintInfoData: {
    data: any;
    options: any;
  },
  ctx: ExecutionContext,
  env: Env
) {
  if (mintInfoData.data?.isCollection) {
    if (
      apiToken.mintCollectionCount &&
      apiToken.mintCollectionLimit &&
      apiToken.mintCollectionCount < apiToken.mintCollectionLimit
    )
      return await mintCollectionNFT({
        externalUserId: apiToken.userExternalId,
        mintInfoData,
        env,
        ctx,
      });
    else {
      return new Response("You have reached your collection mint limit", {
        status: 400,
        headers: corsHeaders,
      });
    }
  } else {
    return await mintCompressedNFT({
      externalUserId: apiToken.userExternalId,
      mintInfoData,
      env,
      ctx,
    });
  }
}
