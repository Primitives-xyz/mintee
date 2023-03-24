import {
  mintCollectionBodySchema,
  mintCompressOptionsSchema,
} from "mintee-utils/dist/zod";
import { apiTokenStatus } from "../../auth";
import { conn, corsHeaders, Env } from "../../utils";

export async function mintCollectionNFT({
  externalUserId,
  mintInfoData,
  env,
  ctx,
}: {
  externalUserId: string;
  mintInfoData: {
    data: any;
    options: any;
  };
  env: Env;
  ctx: ExecutionContext;
}) {
  const collectionBody = await mintCollectionBodySchema.safeParseAsync(
    mintInfoData.data
  );

  const options = await mintCompressOptionsSchema.safeParseAsync(
    mintInfoData.options
  );

  if (!collectionBody.success || !collectionBody.data) {
    return new Response("Error validating collection body", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // call the NFT factory to mint
  const mintResponse = await fetch(`${env.factoryUrl}/api/createCollection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cloudflare-worker-key": env.WORKER_KEY,
    },
    body: JSON.stringify({
      data: collectionBody,
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
  else if (!mintResponse.ok) {
    return new Response("Error minting NFT, error from factory.", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const mintInfo = (await mintResponse.json()) as any;
  // after response update database and tell KV is api is active
  ctx.waitUntil(
    conn
      .transaction(async (trx) => {
        await trx.execute(
          `UPDATE Token SET mintCallsCount = mintCallsCount + 1,
                   canMint = (mintCallsCount + 1) <= mintCallsLimit
                   WHERE userExternalId = ?;`,
          [externalUserId]
        );

        const token = trx.execute(
          "SELECT id, canMint, active, userExternalId FROM Token WHERE userExternalId = ?;",
          [externalUserId]
        );

        return token;
      })
      .then(async (res) => {
        const row = res.rows[0] as apiTokenStatus;
        await conn
          .execute(
            "INSERT INTO NFT (name, creatorUserExternalId, blockchainAddress, minteeMinted, isCompressed, description, symbol, blockchain ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            [
              collectionBody.data.name,
              externalUserId,
              mintInfo.assetId,
              1,
              1,
              collectionBody.data.description,
              collectionBody.data.symbol,
              "Solana",
            ]
          )
          .catch((e) => {
            console.log("Error inserting into NFT table", e);
          });
        // create response with userInfo
        await env.apiTokens.put(mintInfo.assetId, JSON.stringify(row));
      })
  );

  // return compressed asset id
  return new Response(
    JSON.stringify({
      collectionAddress: mintInfo.collectionMint,
      isCompressed: false,
    }),
    { headers: corsHeaders }
  );
}
