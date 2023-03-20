import { JsonMetadata } from "mintee-utils/dist/types";
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
  const external_id = await getExternalKeyandAPIToken(request, env);
  const mintInfo = await mintInfoData(request);

  if (!mintInfo.data) {
    return new Response("data is required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (mintInfo.data.uri) {
    return mintNFTWithUri(external_id, mintInfo, ctx, env);
  } else {
    const offChainDataParse = await validateOffChainBody(mintInfo.data);
    if (!offChainDataParse || !offChainDataParse.success) {
      return new Response("Error parsing body", {
        status: 400,
        headers: corsHeaders,
      });
    }

    await uploadMetadata(offChainDataParse.data, env, external_id);
  }
  return new Response("Error parsing body", {
    status: 400,
    headers: corsHeaders,
  });
}
