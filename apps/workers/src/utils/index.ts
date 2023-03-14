import { connect } from "@planetscale/database";
import { getNFTInfo } from "./nft";
export { getNFTInfo };
import { uploadMetadata } from "./r2";
export { uploadMetadata };
export const corsHeaders = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export type Env = {
  rpcUrl: string;
  r2Url: string;
  factoryUrl: string;
  WORKER_KEY: string;
  bucket: R2Bucket;
  nftInfo: KVNamespace;
  apiTokens: KVNamespace;
};

// Planetscale connection
export const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "g3s67laml1b4smxqc239",
  password: "pscale_pw_RdHk3l4bhvrREUaPkIykgVoRBdJGJLgQp5frEdNi82i",
};

export const conn = connect(psConfig);

export async function apiTokenLookup(external_id: string, env: Env) {
  // grab auth header
  // check if auth header starts with bearer and has a token
  if (!external_id) {
    throw new Error("Unauthorized");
  }
  // grab the token
  // check if the token is in the KVawait
  const response = (await Promise.any([
    lookUserUpKV(external_id, env),
    lookUserUpDB(external_id),
    LookUpUserCache(external_id, env),
  ]).catch((e) => {
    console.log("ERROR looking up user", e);
    throw new Error(e);
  })) as apiTokenStatus;

  return response;
}

export function lookUserUpKV(external_id: string, env: Env) {
  return new Promise(async (resolve, reject) => {
    const response = await env.apiTokens.get(external_id);
    if (response) {
      const userInfo: apiTokenStatus = JSON.parse(response);
      resolve(userInfo);
    }
    reject();
  });
}

export function LookUpUserCache(external_id: string, env: Env) {
  return new Promise(async (resolve, reject) => {
    let cache = caches.default;
    cache.match(external_id).then(async (response) => {
      if (response) {
        const userInfo: apiTokenStatus = await response.json();
        resolve(userInfo);
      }
      reject();
    });
  });
}

export function lookUserUpDB(external_id: string) {
  const response = new Promise(async (resolve, reject) => {
    const response = await conn
      .execute(
        "SELECT id, canMint, active, userId FROM Token WHERE externalKey = ?",
        [external_id]
      )
      .catch((e) => {
        console.log("ERROR", e);
      });

    if (response && response.rows.length > 0) {
      const row = response.rows[0] as apiTokenStatus;
      const userInfo: apiTokenStatus = {
        id: row.id,
        canMint: row.canMint,
        userId: row.userId,
        active: row.active,
      };
      resolve(userInfo);
    }
    reject();
  });
  return response;
}

export type apiTokenStatus = {
  id: number;
  canMint: boolean;
  active: boolean;
  userId: number;
};

export async function sha256(message: any) {
  // encode as UTF-8
  const msgBuffer = await new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert bytes to hex string
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
