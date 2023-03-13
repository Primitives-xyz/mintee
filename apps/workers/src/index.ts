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

export type Env = {
  rpcUrl: string;
  r2Url: string;
  factoryUrl: string;
  bucket: R2Bucket;
  nftInfo: KVNamespace;
  apiTokens: KVNamespace;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mint") {
      // if get request, return error
      if (request.method === "GET") {
        return new Response("GET not allowed", { status: 405 });
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
        },
        body: JSON.stringify({
          name,
          symbol,
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
      const address = url.pathname.split("/")[2];
      const apiKeyLookup = apiTokenLookup(request, env).catch(() => {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      });

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

function apiTokenLookup(request: Request, env: Env) {
  // grab auth header
  const auth = request.headers.get("Authorization");
  // check if auth header starts with bearer and has a token
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  // grab the token
  const token = auth.split(" ")[1];
  if (!token) throw new Error("Unauthorized");
  // check if the token is in the KV
  return env.apiTokens.get(token);
}
