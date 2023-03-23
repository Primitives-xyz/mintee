import { corsHeaders } from "../../utils";

export function helloRoute() {
  return new Response(
    `Hello world! Welcome to Mintee's NFT API. Learn more at https://mintee.io`,
    { headers: corsHeaders }
  );
}
