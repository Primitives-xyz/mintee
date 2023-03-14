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

import { corsHeaders, Env } from "./utils";
import {
  mintRoute,
  mintTreeRoutes,
  nftInfoRoute,
  nftStatusRoute,
  uploadMetadataRoute,
} from "./routes";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mint") {
      return await mintRoute(request, ctx, env);
    }

    if (url.pathname.includes("/nftInfo/")) {
      return await nftInfoRoute(request, env, ctx, url);
    }

    if (url.pathname.startsWith("/nftStatus/")) {
      return await nftStatusRoute(request, env, ctx, url);
    }

    if (url.pathname === "/mintTree") {
      return await mintTreeRoutes(request, env);
    }

    if (url.pathname === "/uploadMetadata") {
      return await uploadMetadataRoute(request, env);
    }

    if (url.pathname === "/") {
      return new Response(
        `Hello world! Welcome to Mintee's NFT API. Learn more at https://mintee.io`,
        { headers: corsHeaders }
      );
    }

    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};
