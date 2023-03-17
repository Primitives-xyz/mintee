import { getMintAuth } from "../../auth";
import { corsHeaders, Env } from "../../utils";

export async function mintTreeRoutes(request: Request, env: Env) {
  const external_id = request.headers.get("x-api-key");
  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }
  const response = await getMintAuth(external_id, env).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  });

  if (!response) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders,
    });
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

  const responseCreateTree = await fetch(`${env.factoryUrl}/api/createTree`);
  if (!responseCreateTree.ok) {
    return new Response("Error creating tree", {
      status: 500,
      headers: corsHeaders,
    });
  }
  const treeInfo = (await responseCreateTree.json()) as {
    treeAddress: string;
    treeWalletSK: string;
  };
  return new Response(JSON.stringify(treeInfo), { headers: corsHeaders });
}
