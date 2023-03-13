/* eslint-disable import/no-anonymous-default-export */
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Request } from "@cloudflare/workers-types";

import { validateMetadataBody } from "mintee-utils";
import { uploadMetadata } from "./r2";
import { getNFTInfo } from "./nft";
import { connect } from "@planetscale/database";

export type Env = {
  rpcUrl: string;
  r2Url: string;
  factoryUrl: string;
  workerKey: string;
  bucket: R2Bucket;
  nftInfo: KVNamespace;
  apiTokens: KVNamespace;
};

const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "g3s67laml1b4smxqc239",
  password: "pscale_pw_RdHk3l4bhvrREUaPkIykgVoRBdJGJLgQp5frEdNi82i",
};

const conn = connect(psConfig);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mint") {
      if (request.method === "GET") {
        // if get request, return error
        return new Response("GET not allowed", { status: 405 });
      }
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = await apiTokenLookup(external_id, env).catch((e) => {
        console.log("Error in apiTokenLookup", e);
      });

      if (!response || !response.id) {
        // return a 401 if no response or no id
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      }

      if (!response.active) {
        // api is not active, go to mintee.io to activate
        return new Response("api is not active, go to mintee.io to activate", {
          status: 401,
          headers: corsHeaders,
        });
      }

      if (!response.canMint) {
        // api is not active, go to mintee.io to activate
        return new Response("api is not allowed to mint", {
          status: 401,
          headers: corsHeaders,
        });
      }

      const { name, symbol } = (await request.json()) as {
        name: string;
        symbol?: string;
      };
      if (!name) {
        return new Response("Name is required", {
          status: 400,
          headers: corsHeaders,
        });
      }
      const mintResponse = await fetch(`${env.factoryUrl}/api/mintCompressed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cloudflare-worker-key": env.workerKey,
        },
        body: JSON.stringify({
          name,
          symbol,
        }),
      }).catch((e) => {
        return new Response("Error minting NFT " + e, {
          status: 500,
        });
      });
      if (!mintResponse.ok) {
        return new Response("Error minting NFT, error from factory.", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const mintInfo = (await mintResponse.json()) as { assetId: string };
      ctx.waitUntil(updateUserTokenStatusPostCall(external_id, env, response));
      return new Response(
        JSON.stringify({
          compressedAssetId: mintInfo.assetId,
        }),
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/mintCompressedToCollection") {
      const mintTreeResponse = await fetch(`${env.factoryUrl}/api/createTree`);
      if (!mintTreeResponse.ok) {
        return new Response("Error minting tree", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const mintTree = (await mintTreeResponse.json()) as {
        treeAddress: string;
        treeWalletSK: string;
      };
      const createCollectionResponse = await fetch(
        `${env.factoryUrl}/api/createCollection`
      );
      if (!createCollectionResponse.ok) {
        return new Response("Error creating collection", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const collectionInfo = (await createCollectionResponse.json()) as any;

      const mintResponse = await fetch(`${env.factoryUrl}/api/mintCompressed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mintTree.treeAddress,
        }),
      });
      if (!mintResponse.ok) {
        return new Response("Error minting NFT", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const mintInfo = (await mintResponse.json()) as { assetId: string };

      return new Response(
        JSON.stringify({
          treeAddress: mintTree.treeAddress,
          compressedAssetId: mintInfo.assetId,
          collectionAddress: collectionInfo.collectionMint,
        }),
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/mintCollection") {
      const createCollectionResponse = await fetch(
        `${env.factoryUrl}/api/createCollection`
      );
      if (!createCollectionResponse.ok) {
        return new Response("Error creating collection", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const collectionInfo = (await createCollectionResponse.json()) as any;

      return new Response(JSON.stringify(collectionInfo), {
        headers: corsHeaders,
      });
    }

    if (url.pathname.startsWith("/nftInfo/")) {
      // after nftInfo/ grab the address
      const address = url.pathname.split("/")[2];

      // check if the address is in the KV
      const kvResponse = await env.nftInfo.get(address);
      if (kvResponse) {
        return new Response(kvResponse, { headers: corsHeaders });
      }

      // if not in KV, get the NFT info from the factory and write it to the KV
      const tokenInfo = await getNFTInfo({ env, address });
      ctx.waitUntil(env.nftInfo.put(address, tokenInfo));
      return new Response(tokenInfo, { headers: corsHeaders });
    }

    if (url.pathname.startsWith("/nftStatus/")) {
      // get address from url
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const apiKeyLookup = apiTokenLookup(external_id, env).catch(() => {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      });
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
      const [kv, fullNftInfo] = await Promise.all([
        apiKeyLookup,
        nftInfoLookup,
      ]);
      if (!kv) {
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

    if (url.pathname === "/createTree") {
      const response = await fetch(`${env.factoryUrl}/api/createTree`);
      if (!response.ok) {
        return new Response("Error creating tree", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const treeInfo = (await response.json()) as {
        treeAddress: string;
        treeWalletSK: string;
      };
      return new Response(JSON.stringify(treeInfo), { headers: corsHeaders });
    }
    if (url.pathname === "/asset") {
      const assetId = url.searchParams.get("assetId");
      if (!assetId) {
        return new Response("assetId is required", {
          status: 400,
          headers: corsHeaders,
        });
      }
      const kvResponse = await env.nftInfo.get(assetId);
      if (kvResponse) {
        return new Response(kvResponse, {
          headers: corsHeaders,
        });
      }
      const assetInfo = await fetch(
        `${env.factoryUrl}/api/asset?assetId=${assetId}`
      ).catch((e) => {
        console.log("ERROR", e);
        return new Response(e.message, { status: 500, headers: corsHeaders });
      });
      if (!assetInfo.ok || !assetInfo) {
        return new Response("Error getting asset info", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const assetInfoJson = JSON.stringify(await assetInfo.json());
      ctx.waitUntil(env.nftInfo.put(assetId, assetInfoJson));
      return new Response(assetInfoJson, {
        headers: corsHeaders,
      });
    }

    if (url.pathname === "/uploadMetadata") {
      // validate body using zod
      const body = validateMetadataBody(await request.json());
      const key = crypto.randomUUID();
      // upload metadata to bucket
      const url = `${env.r2Url}${key}`;
      // insert metadata into database
      await Promise.all([uploadMetadata(body, env, key)]).catch((e) => {
        // if any of the promises fail, return error response
        return new Response(e.message, { status: 500, headers: corsHeaders });
      });
      return new Response(JSON.stringify({ dbUrl: url }), {
        headers: corsHeaders,
      });
    }

    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

async function apiTokenLookup(external_id: string, env: Env) {
  // grab auth header
  // check if auth header starts with bearer and has a token
  if (!external_id) {
    throw new Error("Unauthorized");
  }
  // grab the token
  // check if the token is in the KV
  const response = (await Promise.any([
    lookUserUpKV(external_id, env),
    lookUserUpDB(external_id),
  ]).catch((e) => {
    throw new Error(e);
  })) as apiTokenStatus;
  if (!response.id) {
    throw new Error("Unauthorized");
  }
  return response;
}

function lookUserUpKV(external_id: string, env: Env) {
  return env.apiTokens.get(external_id);
}

function lookUserUpDB(external_id: string) {
  return new Promise(async (resolve, reject) => {
    const response = await conn.execute(
      "SELECT id, can_mint, active FROM Token WHERE externalKey = ?",
      [external_id]
    );
    if (response.rows.length > 0) {
      const row = response.rows[0] as apiTokenStatus;
      const userInfo: apiTokenStatus = {
        id: row.id,
        canMint: row.canMint,
        active: row.active,
      };
      resolve(userInfo);
    }
    reject();
  });
}

function updateUserTokenStatusPostCall(
  external_id: string,
  env: Env,
  tokenInfo: any
) {
  return new Promise(async (resolve, reject) => {
    const response = await conn.execute(
      `UPDATE Token SET mintCallsCount = mintCallsCount + 1,
      canMint = (mintCallsCount + 1) <= nftInfoCallsLimit
      WHERE id = ?;`,
      [tokenInfo.id]
    );
    const row = response.rows[0] as apiTokenStatus;
    const tokenInfoKV = {
      id: tokenInfo.id,
      canMint: row.canMint,
      active: row.active,
    };
    env.apiTokens.put(external_id, JSON.stringify(tokenInfoKV));
    resolve(response);
  });
}

type apiTokenStatus = {
  id: number;
  canMint: boolean;
  active: boolean;
};
