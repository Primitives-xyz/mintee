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
    const response = await env.apiTokens.get(external_id);
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
        "SELECT userExternalId, canMint, active FROM Token WHERE externalKey = ?",
        [external_id]
      )
      .catch((e) => {
        console.log("ERROR", e);
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
};
