import { validateOffChainBody } from "mintee-utils/dist/zod";
import { corsHeaders, Env, uploadMetadata } from "../../utils";
import { mintNFTWithUri } from "./mintNFTWithUri";

export async function uploadOffChainDataAndMint(
  externalUserId: string,
  mintInfoData: {
    data: any;
    options: any;
  },
  ctx: ExecutionContext,
  env: Env
) {
  // we need to upload off chain metadata if no uri
  const offChainDataParse = await validateOffChainBody(mintInfoData.data);
  if (!offChainDataParse || !offChainDataParse.success) {
    return new Response("Error parsing body", {
      status: 400,
      headers: corsHeaders,
    });
  }
  const offChainUriKey = `${
    offChainDataParse.data.name
  }-${new Date().getTime()}`.replace(/ /g, "-");
  await uploadMetadata(offChainDataParse.data, env, offChainUriKey);
  const offChainUri = `${env.r2Url}${offChainUriKey}`;
  mintInfoData.data.uri = offChainUri;
  return await mintNFTWithUri(externalUserId, mintInfoData, ctx, env);
}
