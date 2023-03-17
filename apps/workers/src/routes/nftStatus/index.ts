import { apiTokenStatus, getAuth } from "../../auth";
import { Env, corsHeaders } from "../../utils";

export async function nftStatusRoute(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL
) {
  // get address from url
  const external_id = request.headers.get("x-api-key");
  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }
  const response = getAuth(external_id, env).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  }) as Promise<apiTokenStatus>;

  const address = url.pathname.split("/")[2];

  const nftInfoLookup = fetch(
    `${env.factoryUrl}/api/nftStatus?address=${address}`,
    {
      headers: {
        canMint: "secretkey",
      },
    }
  );
  // resolve promises
  const [userAPITokenInfo, fullNftInfo] = await Promise.all([
    response,
    nftInfoLookup,
  ]);
  if (!userAPITokenInfo) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
  }
  if (!fullNftInfo.ok) {
    return new Response("Error getting NFT info", {
      status: 500,
      headers: corsHeaders,
    });
  }
  if (!userAPITokenInfo.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const nftInfo = (await fullNftInfo.json()) as any;
  ctx.waitUntil(
    env.nftInfo.put(
      nftInfo.address,
      JSON.stringify({
        token: {
          name: nftInfo.name,
          symbol: nftInfo.symbol || null,
          address: nftInfo.address || null,
          collectionAddress: nftInfo.collection?.address || null,
          uri: nftInfo.uri || null,
          editionNonce: nftInfo.editionNonce || null,
          tokenStandard: nftInfo.tokenStandard || null,
        },
        offChain: nftInfo.json || null,
      })
    )
  );
  return new Response(JSON.stringify(nftInfo), { headers: corsHeaders });
}
