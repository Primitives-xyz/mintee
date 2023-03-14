import {
  apiTokenLookup,
  apiTokenStatus,
  corsHeaders,
  Env,
  getNFTInfo,
  sha256,
} from "../../utils";
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
  console.log("NETWORK HERE", network);

  const body = (await request.clone().text()) + external_id;

  // Hash the request body to use it as a part of the cache key
  const hash = await sha256(body);
  const cacheUrl = new URL(request.url);

  // Store the URL in cache by prepending the body's hash
  cacheUrl.pathname = "/nft" + cacheUrl.pathname + hash;

  // Convert to a GET to be able to cache
  const cacheKey = new Request(cacheUrl.toString(), {
    headers: request.headers,
    method: "GET",
  });
  const cache = caches.default;
  // Find the cache key in the cache
  let response = await cache.match(cacheKey);

  // Otherwise, fetch response to POST request from origin
  if (!response) {
    const address = url.pathname.split("/")[2];
    // promise for looking up user token in API
    const tokenLookup = apiTokenLookup(external_id, env).catch((e) => {
      console.log("Error in apiTokenLookup", e);
    }) as Promise<apiTokenStatus>;
    // promise for looking up in KV
    const kvPromise = env.nftInfo.get(address).then(async (response) => {
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
        console.log("nftInfoPromise", response);
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
    const tokenInfo = tokenInfoResponse as string | undefined;
    if (!tokenLookupResponse) {
      return new Response(
        "x-api-key incorrect, if you think this is a mistake contact support@mintee.io",
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    if (!tokenLookupResponse.active) {
      // api is not active, go to mintee.io to activate
      return new Response("api is not active, go to mintee.io to activate", {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (!tokenInfo) {
      return new Response("NFT not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    // if not in KV, get the NFT info from the factory and write it to the KV
    const responseInfo = new Response(tokenInfo, {
      headers: corsHeaders,
    });

    ctx.waitUntil(
      env.nftInfo.put(address, tokenInfo).then(async () => {
        await cache.put(cacheKey, responseInfo.clone());
      })
    );
    return responseInfo.clone();
  }
  return response;
}
