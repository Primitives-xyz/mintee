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
import { validateMintCompressBody } from "mintee-utils";
import { uploadMetadata } from "./r2";
import { getNFTInfo } from "./nft";
import { connect } from "@planetscale/database";

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
const psConfig = {
  host: "aws.connect.psdb.cloud",
  username: "g3s67laml1b4smxqc239",
  password: "pscale_pw_RdHk3l4bhvrREUaPkIykgVoRBdJGJLgQp5frEdNi82i",
};

const conn = connect(psConfig);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mint") {
      // if get request, return error
      if (request.method === "GET") {
        return new Response("GET not allowed", { status: 405 });
      }

      // parse pass in api key
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }

      // check if api key is active / canMint
      const response = await apiTokenLookup(external_id, env).catch((e) => {
        console.log("Error in apiTokenLookup", e);
      });

      if (!response) {
        return new Response("api key not found", { status: 401 });
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

      const json = await request.json().catch((e) => {
        console.log("Error parsing json", e);
      });
      if (!json) {
        return new Response("Error parsing body", {
          status: 400,
          headers: corsHeaders,
        });
      }

      // validate metadata
      const bodyParsePromise = await validateMintCompressBody(json).catch(
        (e) => {
          console.log("Error validating body", e);
        }
      );
      if (!bodyParsePromise) {
        return new Response("Error validating body", {
          status: 400,
          headers: corsHeaders,
        });
      }
      const [body, options] = bodyParsePromise;
      if (!body || !body.name) {
        return new Response("Name is required", {
          status: 400,
          headers: corsHeaders,
        });
      }

      // call the NFT factory to mint
      const mintResponse = await fetch(`${env.factoryUrl}/api/mintCompressed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cloudflare-worker-key": env.WORKER_KEY,
        },
        body: JSON.stringify({
          metadata: body,
          toWalletAddress: options.toWalletAddress,
        }),
      }).catch((e) => {
        console.log("Error minting NFT " + e);
      });

      // if void response, return error
      if (!mintResponse) {
        return new Response("Error minting NFT", {
          status: 500,
          headers: corsHeaders,
        });
      }

      // we got a repsonse, but the status is not ok
      if (mintResponse && !mintResponse.ok) {
        return new Response("Error minting NFT, error from factory.", {
          status: 500,
          headers: corsHeaders,
        });
      }

      const mintInfo = (await mintResponse.json()) as { assetId: string };
      // after response update database and tell KV is api is active
      ctx.waitUntil(
        Promise.all([
          await conn
            .transaction(async (trx) => {
              trx.execute(
                `UPDATE Token SET mintCallsCount = mintCallsCount + 1,
                 canMint = (mintCallsCount + 1) <= mintCallsLimit
                 WHERE externalKey = ?;`,
                [external_id]
              );
              const token = trx.execute(
                "SELECT id, canMint, active, userId FROM Token WHERE externalKey = ?;",
                [external_id]
              );
              trx.execute(
                "INSERT INTO NFT (name, symbol, offChainUrl, description, creaturUserId, blockchain, blockchainAddress, isCompress, treeId",
                [
                  body.name,
                  body.symbol,
                  body.uri,
                  "",
                  response.userId,
                  "Solana",
                  response.id,
                  true,
                  "",
                ]
              );
              return token;
            })
            .then((res) => {
              const row = res.rows[0] as apiTokenStatus;
              // create response with userInfo
              const cache = caches.default;
              cache.put(external_id, new Response(JSON.stringify(row)));
              env.apiTokens.put(external_id, JSON.stringify(row));
            }),
        ])
      );

      // return compressed asset id
      return new Response(
        JSON.stringify({
          compressedAssetId: mintInfo.assetId,
        }),
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/mintCompressedToCollection") {
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = await apiTokenLookup(external_id, env).catch((e) => {
        console.log("Error in apiTokenLookup", e);
      });

      if (!response) {
        return new Response("api key not found", { status: 401 });
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

      const mintTreeResponse = await fetch(`${env.factoryUrl}/api/createTree`);
      if (!mintTreeResponse.ok) {
        return new Response("Error minting tree", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const mintTree = (await mintTreeResponse.json()) as {
        treeAddress: string;
        treeWalletSK: string;
      };
      const createCollectionResponse = await fetch(
        `${env.factoryUrl}/api/createCollection`
      );
      if (!createCollectionResponse.ok) {
        return new Response("Error creating collection", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const collectionInfo = (await createCollectionResponse.json()) as any;

      const mintResponse = await fetch(`${env.factoryUrl}/api/mintCompressed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mintTree.treeAddress,
        }),
      });
      if (!mintResponse.ok) {
        return new Response("Error minting NFT", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const mintInfo = (await mintResponse.json()) as { assetId: string };

      return new Response(
        JSON.stringify({
          treeAddress: mintTree.treeAddress,
          compressedAssetId: mintInfo.assetId,
          collectionAddress: collectionInfo.collectionMint,
        }),
        { headers: corsHeaders }
      );
    }

    if (url.pathname === "/mintCollection") {
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = (await apiTokenLookup(external_id, env).catch((e) => {
        console.log("Error in apiTokenLookup", e);
      })) as apiTokenStatus;

      if (!response.active) {
        // api is not active, go to mintee.io to activate
        return new Response("api is not active, go to mintee.io to activate", {
          status: 401,
          headers: corsHeaders,
        });
      }

      if (!response.canMint) {
        // api is not active, go to mintee.io to activate
        return new Response("api is not allowed to mint", {
          status: 401,
          headers: corsHeaders,
        });
      }
      const createCollectionResponse = await fetch(
        `${env.factoryUrl}/api/createCollection`
      );
      if (!createCollectionResponse.ok) {
        return new Response("Error creating collection", {
          status: 500,
          headers: corsHeaders,
        });
      }
      const collectionInfo = (await createCollectionResponse.json()) as any;

      return new Response(JSON.stringify(collectionInfo), {
        headers: corsHeaders,
      });
    }
    if (url.pathname.includes("/nftInfo/")) {
      const external_id = request.headers.get("x-api-key");

      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }

      const body = (await request.clone().text()) + external_id;

      // Hash the request body to use it as a part of the cache key
      const hash = await sha256(body);
      const cacheUrl = new URL(request.url);

      // Store the URL in cache by prepending the body's hash
      cacheUrl.pathname = "/nft" + cacheUrl.pathname + hash;

      // Convert to a GET to be able to cache
      const cacheKey = new Request(cacheUrl.toString(), {
        headers: request.headers,
        method: "GET",
      });
      const cache = caches.default;
      // Find the cache key in the cache
      let response = await cache.match(cacheKey);

      // Otherwise, fetch response to POST request from origin
      if (!response) {
        const address = url.pathname.split("/")[2];
        // promise for looking up user token in API
        const tokenLookup = apiTokenLookup(external_id, env).catch((e) => {
          console.log("Error in apiTokenLookup", e);
        }) as Promise<apiTokenStatus>;
        // promise for looking up in KV
        const kvPromise = env.nftInfo.get(address).then(async (response) => {
          if (!response) {
            throw new Error("not in kv");
          }
          if (response) {
            return response;
          }
        });
        // promise for looking up in factory, should taken longest
        const nftInfoPromise = getNFTInfo({ env, address })
          .then(async (response) => {
            console.log("nftInfoPromise", response);
            if (!response) {
              throw new Error("factory responds with nothing");
            }
            if (response) {
              return response;
            }
          })
          .catch((e) => {
            throw new Error("factory responds with nothing");
          });

        const anyTokenPromise = Promise.any([kvPromise, nftInfoPromise]);
        const [tokenInfoResponse, tokenLookupResponse] = await Promise.all([
          anyTokenPromise,
          tokenLookup,
        ]);
        const tokenInfo = tokenInfoResponse as string | undefined;
        if (!tokenLookupResponse) {
          return new Response(
            "x-api-key incorrect, if you think this is a mistake contact support@mintee.io",
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        if (!tokenLookupResponse.active) {
          // api is not active, go to mintee.io to activate
          return new Response(
            "api is not active, go to mintee.io to activate",
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }

        if (!tokenInfo) {
          return new Response("NFT not found", {
            status: 404,
            headers: corsHeaders,
          });
        }

        // if not in KV, get the NFT info from the factory and write it to the KV
        const responseInfo = new Response(tokenInfo, {
          headers: corsHeaders,
        });

        ctx.waitUntil(
          env.nftInfo.put(address, tokenInfo).then(async () => {
            await cache.put(cacheKey, responseInfo.clone());
          })
        );
        return responseInfo.clone();
      }
      console.log("cache hit", response);
      return response;
    }

    if (url.pathname.startsWith("/nftStatus/")) {
      // get address from url
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = apiTokenLookup(external_id, env).catch((e) => {
        console.log("Error in apiTokenLookup", e);
      }) as Promise<apiTokenStatus>;

      const address = url.pathname.split("/")[2];

      const nftInfoLookup = fetch(
        `${env.factoryUrl}/api/nftStatus?address=${address}`,
        {
          headers: {
            canMint: "secretkey",
          },
        }
      );
      // resolve promises
      const [userAPITokenInfo, fullNftInfo] = await Promise.all([
        response,
        nftInfoLookup,
      ]);
      if (!userAPITokenInfo) {
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders,
        });
      }
      if (!fullNftInfo.ok) {
        return new Response("Error getting NFT info", {
          status: 500,
          headers: corsHeaders,
        });
      }
      if (!userAPITokenInfo.active) {
        // api is not active, go to mintee.io to activate
        return new Response("api is not active, go to mintee.io to activate", {
          status: 401,
          headers: corsHeaders,
        });
      }

      const nftInfo = (await fullNftInfo.json()) as any;
      ctx.waitUntil(
        env.nftInfo.put(
          nftInfo.address,
          JSON.stringify({
            token: {
              name: nftInfo.name,
              symbol: nftInfo.symbol || null,
              address: nftInfo.address || null,
              collectionAddress: nftInfo.collection?.address || null,
              uri: nftInfo.uri || null,
              editionNonce: nftInfo.editionNonce || null,
              tokenStandard: nftInfo.tokenStandard || null,
            },
            offChain: nftInfo.json || null,
          })
        )
      );
      return new Response(JSON.stringify(nftInfo), { headers: corsHeaders });
    }

    if (url.pathname === "/mintTree") {
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = await apiTokenLookup(external_id, env).catch((e) => {
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

      const responseCreateTree = await fetch(
        `${env.factoryUrl}/api/createTree`
      );
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

    if (url.pathname === "/uploadMetadata") {
      const external_id = request.headers.get("x-api-key");
      if (!external_id) {
        // if no external_id, return error
        return new Response("x-api-key header is required", { status: 400 });
      }
      const response = (await apiTokenLookup(external_id, env).catch((e) => {
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

    if (url.pathname === "/") {
      return new Response(
        `Hello world! Welcome to Mintee's NFT API. Learn more at https://mintee.io`,
        { headers: corsHeaders }
      );
    }

    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

async function apiTokenLookup(external_id: string, env: Env) {
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

function lookUserUpKV(external_id: string, env: Env) {
  return new Promise(async (resolve, reject) => {
    const response = await env.apiTokens.get(external_id);
    if (response) {
      const userInfo: apiTokenStatus = JSON.parse(response);
      resolve(userInfo);
    }
    reject();
  });
}

function LookUpUserCache(external_id: string, env: Env) {
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

function lookUserUpDB(external_id: string) {
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

type apiTokenStatus = {
  id: number;
  canMint: boolean;
  active: boolean;
  userId: number;
};

async function sha256(message: any) {
  // encode as UTF-8
  const msgBuffer = await new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert bytes to hex string
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
