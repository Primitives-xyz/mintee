import { minteeNFTInfo } from "mintee-utils";
import { apiTokenStatus, getAuth } from "../../auth";
import { conn, corsHeaders, Env, getNFTInfo } from "../../utils";
import { networkStringLiteral } from "../../utils/nft";
import { publicKey, PublicKey } from "@metaplex-foundation/umi";
export async function nftInfoRoute(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL
) {
  let error = undefined;

  const external_id = request.headers.get("x-api-key");
  const network = request.headers.get("network") as
    | networkStringLiteral
    | undefined;

  if (!external_id) {
    // if no external_id, return error
    return new Response("x-api-key header is required", { status: 400 });
  }
  // Convert to a GET to be able to cache

  const address = url.pathname.split("/")[2];
  // Store the URL in cache by prepending the body's hash
  // Find the cache key in the cache
  if (!address) {
    return new Response("address is required", {
      status: 400,
      headers: corsHeaders,
    });
  }

  // promise for looking up user token in API
  const apiTokenLookup = getAuth(external_id, env, request.url).catch((e) => {
    console.log("Error in apiTokenLookup", e);
  }) as Promise<apiTokenStatus>;

  const anyTokenPromise = nftPromises(env, address, network);

  const promiseResponse = await Promise.all([
    anyTokenPromise,
    apiTokenLookup,
    isPublicKeyPromise(address),
  ]).catch((e) => {
    error = e;
    console.log("Error in Promise.all", e);
  });

  if (!promiseResponse) {
    return new Response(error, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const [tokenInfoResponse, apiTokenLookupResponse, publicKeyResponse] =
    promiseResponse;

  if (!publicKeyResponse) {
    return new Response("Invalid address", {
      status: 400,
      headers: corsHeaders,
    });
  } else if (!apiTokenLookupResponse) {
    return new Response(
      "x-api-key is not connected to an account, if you think this is a mistake contact support@mintee.io",
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  } else if (!apiTokenLookupResponse.active) {
    // api is not active, go to mintee.io to activate
    return new Response("api is not active, go to mintee.io to activate", {
      status: 401,
      headers: corsHeaders,
    });
  } else if (!tokenInfoResponse) {
    return new Response("NFT not found", {
      status: 404,
      headers: corsHeaders,
    });
  }

  // if not in KV, get the NFT info from the factory and write it to the KV
  const responseInfo = new Response(tokenInfoResponse, {
    headers: { ...corsHeaders },
  });

  ctx.waitUntil(
    env.nftInfo.put(address + network, tokenInfoResponse).then(async (r) => {
      await conn
        .transaction(async (trx) => {
          const nftInfo = JSON.parse(tokenInfoResponse) as minteeNFTInfo;
          await trx
            .execute(
              `INSERT INTO NFT (name, symbol, uri, description, image, blockchainAddress, sellerFeeBasisPoints, isMutable,  blockchain, primarySaleHappened, network) VALUES (?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?);`,
              [
                nftInfo.name,
                nftInfo.symbol,
                nftInfo.uri,
                nftInfo.description,
                nftInfo.image,
                nftInfo.blockchainAddress,
                nftInfo.sellerFeeBasisPoints,
                nftInfo.isMutable,
                "Solana",
                nftInfo.primarySaleHappened,
                network === "devnet" ? "DEVNET" : "MAINNET",
              ]
            )
            .catch((e) => {
              console.log("error in insert nft", e);
            });
          await trx.execute(
            `UPDATE Token SET nftInfoCallsCount = nftInfoCallsCount + 1,
             active = (nftInfoCallsCount + 1) <= nftInfoCallsLimit
             WHERE externalKey = ?;`,
            [external_id]
          );
          return trx.execute(
            "SELECT id, canMint, active, userExternalId FROM Token WHERE externalKey = ?;",
            [external_id]
          );
        })
        .then(async (conn_result) => {
          const row = conn_result.rows[0] as apiTokenStatus;
          await env.apiTokens.put(external_id, JSON.stringify(row));
        });
    })
  );

  return responseInfo;
}

const isPublicKeyPromise = (address: string): Promise<PublicKey> => {
  return new Promise((resolve, reject) => {
    try {
      const pk = publicKey(address);
      resolve(pk);
    } catch (e) {
      reject(e);
    }
  });
};

function nftPromises(
  env: Env,
  address: string,
  network?: networkStringLiteral
) {
  // promise for looking up in KV
  const kvPromise = env.nftInfo
    .get(address + network)
    .then(async (response) => {
      if (!response) {
        throw new Error("not in kv");
      }
      if (response) {
        return response;
      }
    });

  const compressedNFTInfoPromise = fetch(env.rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "get_asset",
      id: "compression-example",
      params: [address],
    }),
  }).then(async (response) => {
    if (!response) {
      throw new Error("not in compressed");
    }
    if (response) {
      const json = (await response.json()) as any;
      const offChain = await fetch(json.result.content.json_uri).catch((e) => {
        console.log("Error in offChain", e);
      });
      const offChainJson = (await offChain!.json()) as any;

      const metadata = json.result.content.metadata;

      const body = {
        name: metadata.name,
        symbol: metadata.symbol,
        image: offChainJson.image,
        blockchainAddress: address,
        description: metadata.description,
        sellerFeeBasisPoints: json.result.royalty.basis_points,
        primarySaleHappened: json.result.content.primary_sale_happened,
        isMutable: json.result.is_mutable,
        externalUrl: offChainJson.external_url,
      } as minteeNFTInfo;
      const v = JSON.stringify(body);
      return v;
    }
  });

  // promise for looking up in factory, should taken longest
  const nftInfoPromise = getNFTInfo({
    env,
    address,
    network: network ? network : undefined,
  })
    .catch((e) => {
      throw new Error("factory responds with nothing");
    })
    .then(async (response) => {
      if (!response) {
        throw new Error("factory responds with nothing");
      }
      if (response) {
        console.log("not right here", response);
        return response;
      }
    });

  return Promise.any([compressedNFTInfoPromise, kvPromise, nftInfoPromise]);
}
