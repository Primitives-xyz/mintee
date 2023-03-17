import { apiTokenStatus, getAuth } from "../../auth";
import { conn, corsHeaders, Env, getNFTInfo, sha256 } from "../../utils";
import { networkStringLiteral } from "../../utils/nft";

export async function nftInfoRoute(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL
) {
  const external_id = request.headers.get("x-api-key");
  const network = request.headers.get("network") as
    | networkStringLiteral
    | undefined;

  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }
  // Convert to a GET to be able to cache

  const address = url.pathname.split("/")[2];
  // Store the URL in cache by prepending the body's hash
  // Find the cache key in the cache
  if (!address) {
    return new Response("address is required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Otherwise, fetch response to POST request from origin

  // promise for looking up user token in API
  const tokenLookup = getAuth(external_id, env, request.url).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  }) as Promise<apiTokenStatus>;
  // promise for looking up in KV
  const kvPromise = env.nftInfo
    .get(address + network)
    .then(async (response) => {
      if (!response) {
        throw new Error("not in kv");
      }
      if (response) {
        return response;
      }
    });
  // promise for looking up in factory, should taken longest
  const nftInfoPromise = getNFTInfo({
    env,
    address,
    network: network ? network : undefined,
  })
    .then(async (response) => {
      if (!response) {
        throw new Error("factory responds with nothing");
      }
      if (response) {
        return response;
      }
    })
    .catch((e) => {
      throw new Error("factory responds with nothing");
    });

  const anyTokenPromise = Promise.any([kvPromise, nftInfoPromise]);
  const [tokenInfoResponse, tokenLookupResponse] = await Promise.all([
    anyTokenPromise,
    tokenLookup,
  ]);

  if (!tokenLookupResponse) {
    return new Response(
      "x-api-key incorrect, if you think this is a mistake contact support@mintee.io",
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  } else if (!tokenLookupResponse.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  } else if (!tokenInfoResponse) {
    return new Response("NFT not found", {
      status: 404,
      headers: corsHeaders,
    });
  }

  // if not in KV, get the NFT info from the factory and write it to the KV
  const responseInfo = new Response(tokenInfoResponse, {
    headers: { ...corsHeaders },
  });

  ctx.waitUntil(
    env.nftInfo.put(address + network, tokenInfoResponse).then(async (r) => {
      return await conn
        .transaction(async (trx) => {
          trx.execute(
            `UPDATE Token SET nftInfoCallsCount = nftInfoCallsCount + 1,
             active = (nftInfoCallsCount + 1) <= nftInfoCallsLimit
             WHERE externalKey = ?;`,
            [external_id]
          );
          return trx.execute(
            "SELECT id, canMint, active, userExternalId FROM Token WHERE externalKey = ?;",
            [external_id]
          );
        })
        .then(async (conn_result) => {
          const row = conn_result.rows[0] as apiTokenStatus;
          await env.apiTokens.put(external_id, JSON.stringify(row));
        });
    })
  );

  return responseInfo;
}
