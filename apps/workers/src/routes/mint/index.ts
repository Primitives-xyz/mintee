import { validateMintCompressBody } from "mintee-utils";
import { apiTokenStatus, getMintAuth } from "../../auth";
import { conn, corsHeaders, Env } from "../../utils";

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
  const response = await getMintAuth(external_id, env, request.url).catch(
    (e) => {
      console.log("Error in fetch api token", e);
    }
  );
  if (!response) {
    return new Response("api key not found", { status: 401 });
  }

  // try to grab body
  const json = (await request.json().catch((e) => {
    console.log("Error parsing json", e);
  })) as { data: any; options: any };

  if (!json) {
    return new Response("Error parsing body pal!", {
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
    console.log("Error validating body from zod function", e);
  });
  if (!bodyParsePromise) {
    return new Response("Error validating bod", {
      status: 400,
      headers: corsHeaders,
    });
  }
  const [body, options] = bodyParsePromise;
  if (!body) {
    return new Response("Body required", {
      status: 400,
      headers: corsHeaders,
    });
  } else if (!body.success) {
    return new Response(
      "Error validating body: " +
        body.error.errors.map((e) => e.path[0].toString() + " " + e.message),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  } else if (!options || !options.success) {
    return new Response("Error validating options", {
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
      data: body.data,
      options,
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

  const mintInfo = (await mintResponse.json()) as any;
  // after response update database and tell KV is api is active
  ctx.waitUntil(
    Promise.all([
      await conn
        .transaction(async (trx) => {
          await trx.execute(
            `UPDATE Token SET mintCallsCount = mintCallsCount + 1,
                 canMint = (mintCallsCount + 1) <= mintCallsLimit
                 WHERE externalKey = ?;`,
            [external_id]
          );

          const token = trx.execute(
            "SELECT id, canMint, active, userExternalId FROM Token WHERE externalKey = ?;",
            [external_id]
          );

          return token;
        })
        .then(async (res) => {
          console.log("RIGHT BEFORE");
          const row = res.rows[0] as apiTokenStatus;
          console.log("RIGHT AFTER");
          await conn
            .execute(
              "INSERT INTO NFT (name, creatorUserExternalId, blockchainAddress, minteeMinted,isCompressed, description, symbol, blockchain ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
              [
                body.data.name,
                row.userExternalId,
                mintInfo.assetId,
                true,
                true,
                body.data.description,
                body.data.symbol,
                "Solana",
              ]
            )
            .catch((e) => {
              console.log("Error inserting into NFT table", e);
            });
          // create response with userInfo
          env.apiTokens.put(mintInfo.assetId, JSON.stringify(row));
        }),
    ])
  );

  // return compressed asset id
  return new Response(
    JSON.stringify({
      mintAddress: mintInfo.assetId,
      treeWalletAddress: mintInfo.treeWalletAddress,
      leafIndex: mintInfo.leafIndex,
      isCompressed: true,
    }),
    { headers: corsHeaders }
  );
}
