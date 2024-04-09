import { minteeNFTInfo } from "mintee-utils";
import { apiTokenStatus, getAuth } from "../../auth";
import { conn, corsHeaders, Env, getNFTInfo } from "../../utils";
import { networkStringLiteral } from "../../utils/nft";

export async function nftStatusResolver(
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

  // promise for looking up user token in API
  const authTokenLookup = getAuth(external_id, env, request.url).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  }) as Promise<apiTokenStatus>;
  // promise for looking up in KV

  const nftInfoPromise = getNFTInfo({
    env,
    address,
    network: network ? network : undefined,
  }).catch((e) => {
    throw new Error("factory responds with nothing");
  });
  const [authTokenInfoResponse, tokenLookupResponse] = await Promise.all([
    authTokenLookup,
    nftInfoPromise,
  ]).catch((e) => {
    console.log("Error in Promise.all", e);
    throw new Error("Error in Promise.all");
  });
  if (!tokenLookupResponse) {
    return new Response(
      "x-api-key is not connected to an account, if you think this is a mistake contact support@mintee.io",
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  } else if (!authTokenInfoResponse.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // if not in KV, get the NFT info from the factory and write it to the KV
  const responseInfo = new Response(tokenLookupResponse, {
    headers: { ...corsHeaders },
  });

  ctx.waitUntil(
    env.nftInfo.put(address + network, tokenLookupResponse).then(async (r) => {
      await conn
        .transaction(async (trx) => {
          const nftInfo = JSON.parse(tokenLookupResponse) as minteeNFTInfo;
          await trx
            .execute(
              `INSERT INTO NFT (name, symbol, uri, description, image, blockchainAddress, sellerFeeBasisPoints, isMutable,  blockchain, primarySaleHappened, network) VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?);`,
              [
                nftInfo.name,
                nftInfo.symbol,
                nftInfo.uri,
                nftInfo.description,
                nftInfo.image,
                nftInfo.blockchainAddress,
                nftInfo.sellerFeeBasisPoints,
                nftInfo.isMutable,
                "Solana",
                nftInfo.primarySaleHappened,
                network === "devnet" ? "DEVNET" : "MAINNET",
              ]
            )
            .catch((e) => {
              console.log("error in insert nft", e);
            });
          await trx.execute(
            `UPDATE Token SET nftInfoCallsCount = nftInfoCallsCount + 1,
             active = (nftInfoCallsCount + 1) <= nftInfoCallsLimit
             WHERE externalKey = ?;`,
            [external_id]
          );
          return trx.execute(
            "SELECT id, canMint, active, userExternalId, mintCollectionCount, mintCollectionLimit FROM Token WHERE externalKey = ?;",
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
