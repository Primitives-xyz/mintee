import { getExternalKeyandAPIToken } from "../../auth";
import { corsHeaders, Env } from "../../utils";
import { mintInfoData } from "./mintInfoData";
import { mintNFTWithUri } from "./mintNFTWithUri";
import { uploadOffChainDataAndMint } from "./uploadOffChaindataAndMint";

export async function mintRoute(
  request: Request,
  ctx: ExecutionContext,
  env: Env
) {
  const externalUserId = await getExternalKeyandAPIToken(request, env);
  const mintInfo = await mintInfoData(request);

  if (!externalUserId) {
    return new Response("x-api-key header is required", {
      status: 400,
      headers: corsHeaders,
    });
  } else if (!mintInfo.data) {
    return new Response("data is required", {
      status: 400,
      headers: corsHeaders,
    });
  } else if (mintInfo.data.uri) {
    return await mintNFTWithUri(externalUserId, mintInfo, ctx, env);
  } else if (mintInfo.data.name) {
    // we need to upload off chain metadata if no uri
    return await uploadOffChainDataAndMint(externalUserId, mintInfo, ctx, env);
  }

  return new Response("uri or name is required", {
    status: 400,
    headers: corsHeaders,
  });
}
