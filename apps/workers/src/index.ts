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
import {
  Env,
  signJWT,
  uploadMetadata,
  validateMetadataBody,
  verifyJWT,
} from "mintee-utils";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/signJWT") {
      const token = await signJWT(request);
      return new Response(JSON.stringify({ token }));
    }

    if (url.pathname === "/verifyJWT") {
      const decoded = await verifyJWT(request);
      return new Response(JSON.stringify(decoded));
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
