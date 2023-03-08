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
import { Env } from "worker-types";
import { validateMetadataBody } from "mintee-utils";
import { uploadMetadata } from "./r2";
import { getNFTInfoAndWriteToKV } from "./nft";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/nftInfo/")) {
      // after nftInfo/ grab the address
      const address = url.pathname.split("/")[2];

      // check if the address is in the KV
      const kvResponse = await env.nftInfo.get(address);
      if (kvResponse) {
        return new Response(kvResponse);
      }

      // if not in KV, get the NFT info from the factory and write it to the KV
      const tokenInfo = await getNFTInfoAndWriteToKV({ env, address });
      return new Response(tokenInfo);
    }

    if (url.pathname.startsWith("/nftStatus/")) {
      // get address from url
      const address = url.pathname.split("/")[2];
      const fullNftInfo = await fetch(
        `${env.factoryUrl}/api/nftStatus?address=${address}`,
        {
          headers: {
            secret: "YO!",
          },
        }
      );
      if (!fullNftInfo.ok) {
        return new Response("Error getting NFT info", { status: 500 });
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
      return new Response(JSON.stringify(nftInfo));
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
        return new Response(e.message, { status: 500 });
      });
      return new Response(JSON.stringify({ dbUrl: url }));
    }

    // return error response saying path noth found
    return new Response("Path not found", { status: 404 });
  },
};
