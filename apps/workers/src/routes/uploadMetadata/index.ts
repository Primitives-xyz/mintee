import { apiTokenStatus, getAuth } from "../../auth";
import { Env, corsHeaders, uploadMetadata } from "../../utils";

export async function uploadMetadataRoute(request: Request, env: Env) {
  const external_id = request.headers.get("x-api-key");
  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }
  const response = (await getAuth(external_id, env).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  })) as apiTokenStatus;

  if (!response.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  }
  // validate body using zod
  const body = await request.json();
  const key = crypto.randomUUID();
  // upload metadata to bucket
  const url = `${env.r2Url}${key}`;
  // insert metadata into database
  await Promise.all([uploadMetadata(body as any, env, key)]).catch((e) => {
    // if any of the promises fail, return error response
    return new Response(e.message, { status: 500, headers: corsHeaders });
  });
  return new Response(JSON.stringify({ dbUrl: url }), {
    headers: corsHeaders,
  });
}
