import { connect } from "@planetscale/database";

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
