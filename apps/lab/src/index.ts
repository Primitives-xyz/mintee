/* eslint-disable import/no-anonymous-default-export */

import { corsHeaders, Env } from "./utils";
import {
  Context,
  PublicKey,
  RpcBaseOptions,
  chunk,
  publicKey,
  assertAccountExists,
  base58PublicKey,
  parseJsonFromGenericFile,
} from "@metaplex-foundation/umi";
import {
  findLargestTokensByMint,
  Token,
} from "@metaplex-foundation/mpl-essentials";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  deserializeDigitalAssetWithToken,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { DigitalAsset } from "./digitalasset";
import {
  TokenRecord,
  findMetadataPda,
  findMasterEditionPda,
  findTokenRecordPda,
} from "./generated";
import { minteeNFTInfo } from "mintee-utils";
import { JsonMetadata } from "mintee-utils/dist/types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/nftInfo")) {
      const address = url.pathname.split("/")[2];
      const umi = createUmi(env.rpcUrl).use(mplTokenMetadata());
      const pk = publicKey(address);

      // fetch and deserialize data
      const infoResponseArray = await fetchAllDigitalAssetWithTokenByMint(
        umi,
        pk
      );

      const infoResponse = infoResponseArray[0];
      const creators =
        infoResponse.metadata.creators.__option === "Some"
          ? infoResponse.metadata.creators.value
          : [];

      const info = {
        name: infoResponse.metadata.name,
        symbol: infoResponse.metadata.symbol,
        uri: infoResponse.metadata.uri,
        sellerFeeBasisPoints: infoResponse.metadata.sellerFeeBasisPoints,
        creators: creators.map((creator) => ({
          address: base58PublicKey(creator.address),
          verified: creator.verified,
          share: creator.share,
        })),
        primarySaleHappened: infoResponse.metadata.primarySaleHappened,
        isMutable: infoResponse.metadata.isMutable,
      } as minteeNFTInfo;
      if (info.uri) {
        const json: JsonMetadata = await fetch(info.uri).then((res) =>
          res.json()
        );
        console.log(json);
        info.attributes = json.attributes;
        info.externalUrl = json.external_url;
        info.image = json.image;
        info.description = json.description;
      }
      return new Response(JSON.stringify(info), {
        status: 200,
        headers: corsHeaders,
      });
    }
    // return error response saying path noth found
    return new Response("Path not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
};

export type DigitalAssetWithToken = DigitalAsset & {
  token: Token;
  tokenRecord?: TokenRecord;
};

export async function fetchAllDigitalAssetWithTokenByMint(
  context: Pick<Context, "rpc" | "serializer" | "eddsa" | "programs">,
  mint: PublicKey,
  options?: RpcBaseOptions
): Promise<DigitalAssetWithToken[]> {
  const largestTokens = await findLargestTokensByMint(context, mint, options);
  const nonEmptyTokens = largestTokens
    .filter((token) => token.amount.basisPoints > 0)
    .map((token) => token.publicKey);
  const accountsToFetch = [
    mint,
    findMetadataPda(context, { mint }),
    findMasterEditionPda(context, { mint }),
  ];
  accountsToFetch.push(
    ...nonEmptyTokens.flatMap((token) => [
      token,
      findTokenRecordPda(context, { mint, token }),
    ])
  );
  const accounts = await context.rpc.getAccounts(accountsToFetch, options);
  const [mintAccount, metadataAccount, editionAccount, ...tokenAccounts] =
    accounts;
  assertAccountExists(mintAccount, "Mint");
  assertAccountExists(metadataAccount, "Metadata");

  return chunk(tokenAccounts, 2).flatMap(
    ([tokenAccount, tokenRecordAccount]): DigitalAssetWithToken[] => {
      if (!tokenAccount.exists) return [];
      return [
        deserializeDigitalAssetWithToken(
          context,
          mintAccount,
          metadataAccount,
          tokenAccount,
          editionAccount.exists ? editionAccount : undefined,
          tokenRecordAccount.exists ? tokenRecordAccount : undefined
        ),
      ];
    }
  );
}
