/* eslint-disable import/no-anonymous-default-export */

import { corsHeaders, Env } from "./utils";
import {
  helloRoute,
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
      return helloRoute();
    }

    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};
