import { conn, Env } from "../utils";

export async function getMintAuth(external_id: string, env: Env, url: string) {
  // grab auth header
  // check if auth header starts with bearer and has a token
  if (!external_id) {
    throw new Error("No external_id");
  }
  // grab the token

  // check if the token is in the KVawait
  const response = (await Promise.any([
    lookUserUpKV(external_id, env),
    lookUserUpDB(external_id),
  ]).catch((e) => {
    console.log("ERROR looking up user", e);
    throw new Error(e);
  })) as apiTokenStatus;
  if (!response) {
    throw new Error("No token found: " + external_id);
  } else if (!response.active) {
    throw new Error("Token is not active: " + external_id);
  } else if (!response.canMint) {
    throw new Error("Token cannot mint: " + external_id);
  }
  return response;
}

export async function getAuth(external_id: string, env: Env, url: string) {
  // grab auth header
  // check if auth header starts with bearer and has a token
  if (!external_id) {
    throw new Error("No external_id");
  }
  // grab the token
  // check if the token is in the KVawait
  const response = (await Promise.any([
    lookUserUpKV(external_id, env),
    lookUserUpDB(external_id),
  ]).catch((e) => {
    console.log("ERROR looking up user", e);
    throw new Error(e);
  })) as apiTokenStatus;

  if (!response) {
    throw new Error("No token found: " + external_id);
  } else if (!response.active) {
    throw new Error("Token is not active: " + external_id);
  }

  return response;
}

export function lookUserUpKV(external_id: string, env: Env) {
  return new Promise(async (resolve, reject) => {
    const response = await env.apiTokens.get(external_id).catch((e) => {
      console.log("ERROR", e);
      reject(e);
    });
    if (response) {
      resolve(JSON.parse(response) as apiTokenStatus);
    }
    reject();
  });
}

export function lookUserUpDB(external_id: string): Promise<apiTokenStatus> {
  const response = new Promise(async (resolve, reject) => {
    const response = await conn
      .execute(
        "SELECT userExternalId, canMint, active, mintCollectionCount, mintCollectionLimit FROM Token WHERE externalKey = ?",
        [external_id]
      )
      .catch((e) => {
        console.log("ERROR", e);
        reject(e);
      });
    if (response && response.rows.length > 0) {
      resolve(response.rows[0]);
    }
    reject();
  });
  return response as Promise<apiTokenStatus>;
}

export type apiTokenStatus = {
  canMint: boolean;
  active: boolean;
  userExternalId: string;
  mintCollectionCount?: number;
  mintCollectionLimit?: number;
};

export async function getExternalKeyandAPIToken(request: Request, env: Env) {
  // if get request, return error
  if (request.method === "GET") {
    throw new Error("GET not allowed");
  }
  // parse pass in api key
  const external_id = request.headers.get("x-api-key");
  if (!external_id) {
    // if no external_id, return error
    throw new Error("x-api-key header is required");
  }

  // check if api key is active / canMint
  const response = await getMintAuth(external_id, env, request.url).catch(
    (e) => {
      console.log("Error in fetch api token", e);
    }
  );
  if (!response) {
    throw new Error("api key not found");
  }

  return response;
}
