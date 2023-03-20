import { validateOffChainBody } from "mintee-utils/dist/zod";
import { getExternalKeyandAPIToken } from "../../auth";
import { corsHeaders, Env, uploadMetadata } from "../../utils";
import { mintInfoData } from "./mintInfoData";
import { mintNFTWithUri } from "./mintNFTWithUri";

export async function mintRoute(
  request: Request,
  ctx: ExecutionContext,
  env: Env
) {
  const externalUserId = await getExternalKeyandAPIToken(request, env);
  const mintInfo = await mintInfoData(request);

  if (!mintInfo.data) {
    return new Response("data is required", {
      status: 400,
      headers: corsHeaders,
    });
  }
  if (mintInfo.data.uri) {
    return mintNFTWithUri(externalUserId, mintInfo, ctx, env);
  } else {
    // we need to upload off chain metadata if no uri
    const offChainDataParse = await validateOffChainBody(mintInfo.data);
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
    mintInfo.data.uri = offChainUri;
    return await mintNFTWithUri(externalUserId, mintInfo, ctx, env);
  }
}
