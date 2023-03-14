import { validateMintCompressBody } from "mintee-utils";
import {
  apiTokenLookup,
  apiTokenStatus,
  conn,
  corsHeaders,
  Env,
} from "../../utils";

export async function mintRoute(
  request: Request,
  ctx: ExecutionContext,
  env: Env
) {
  // if get request, return error
  if (request.method === "GET") {
    return new Response("GET not allowed", { status: 405 });
  }

  // parse pass in api key
  const external_id = request.headers.get("x-api-key");
  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }

  // check if api key is active / canMint
  const response = await apiTokenLookup(external_id, env).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  });

  if (!response) {
    return new Response("api key not found", { status: 401 });
  } else if (!response.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  } else if (!response.canMint) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not allowed to mint", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const json = (await request.json().catch((e) => {
    console.log("Error parsing json", e);
  })) as { data: any; options: any };
  if (!json) {
    return new Response("Error parsing body", {
      status: 400,
      headers: corsHeaders,
    });
  } else if (!json.data) {
    return new Response("data is required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // validate metadata
  const bodyParsePromise = await validateMintCompressBody({
    data: json.data,
    options: json.options,
  }).catch((e) => {
    console.log("Error validating body", e);
  });
  if (!bodyParsePromise) {
    return new Response("Error validating body", {
      status: 400,
      headers: corsHeaders,
    });
  }
  const [body, options] = bodyParsePromise;
  if (!body || !body.name) {
    return new Response("Name is required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // call the NFT factory to mint
  const mintResponse = await fetch(`${env.factoryUrl}/api/mintCompressed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cloudflare-worker-key": env.WORKER_KEY,
    },
    body: JSON.stringify({
      metadata: body,
      toWalletAddress: options.toWalletAddress,
    }),
  }).catch((e) => {
    console.log("Error minting NFT " + e);
  });

  // if void response, return error
  if (!mintResponse) {
    return new Response("Error minting NFT", {
      status: 500,
      headers: corsHeaders,
    });
  }

  // we got a repsonse, but the status is not ok
  if (mintResponse && !mintResponse.ok) {
    return new Response("Error minting NFT, error from factory.", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const mintInfo = (await mintResponse.json()) as { assetId: string };
  // after response update database and tell KV is api is active
  ctx.waitUntil(
    Promise.all([
      await conn
        .transaction(async (trx) => {
          trx.execute(
            `UPDATE Token SET mintCallsCount = mintCallsCount + 1,
                 canMint = (mintCallsCount + 1) <= mintCallsLimit
                 WHERE externalKey = ?;`,
            [external_id]
          );
          const token = trx.execute(
            "SELECT id, canMint, active, userId FROM Token WHERE externalKey = ?;",
            [external_id]
          );
          trx.execute(
            "INSERT INTO NFT (name, symbol, offChainUrl, description, creaturUserId, blockchain, blockchainAddress, isCompress, treeId",
            [
              body.name,
              body.symbol,
              body.uri,
              "",
              response.userId,
              "Solana",
              response.id,
              true,
              "",
            ]
          );
          return token;
        })
        .then((res) => {
          const row = res.rows[0] as apiTokenStatus;
          // create response with userInfo
          const cache = caches.default;
          cache.put(external_id, new Response(JSON.stringify(row)));
          env.apiTokens.put(mintInfo.assetId, JSON.stringify(row));
        }),
    ])
  );

  // return compressed asset id
  return new Response(
    JSON.stringify({
      compressedAssetId: mintInfo.assetId,
    }),
    { headers: corsHeaders }
  );
}
