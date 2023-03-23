/* eslint-disable import/no-anonymous-default-export */

import { conn, corsHeaders, Env } from "./utils";
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/clerkUserSignUp") {
      const body = (await request.json()) as any;
      const {
        object,
        type,
        data,
      }: {
        object: string;
        type: string;
        data: any;
      } = body;

      if (object === "event" && type === "user.created") {
        const user = data;
        const apiKey = generateExternalApiToken(
          user!.email_addresses[0].email_address
        );
        console.log("right before sql");
        await conn.transaction(async (trx) => {
          await trx
            .execute(
              "INSERT IGNORE INTO User (externalId, email, firstName, lastName) VALUES (?, ?, ?, ?) ",
              [
                user.id,
                user!.email_addresses[0].email_address,
                user!.first_name,
                user!.last_name,
              ]
            )
            .catch((e) => {
              console.log(e);
            });

          // generate a new externalKey for our api

          await trx.execute(
            "INSERT INTO Token (userExternalId, active, nftInfoCallsLimit, mintCallsLimit, canMint, type, externalKey) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user.id, true, 1000, 25, true, "API", apiKey]
          );
        });

        return new Response("clerkUserSignUp", {
          status: 200,
          headers: corsHeaders,
        });
      }
    }
    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

function generateExternalApiToken(email: string) {
  const timestamp = Date.now().toString();
  let bytes = new TextEncoder().encode(`${email}:${timestamp}`);

  // remove equal signs
  return bytes2hex(bytes).replace(/=/g, "");
}

function bytes2hex(bytes: Uint8Array) {
  return Array.prototype.map
    .call(bytes, (byte) => ("0" + byte.toString(16)).slice(-2))
    .join("");
}
