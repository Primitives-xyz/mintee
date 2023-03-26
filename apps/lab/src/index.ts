/* eslint-disable import/no-anonymous-default-export */

import { conn, Env } from "./utils";
import {
  Context,
  PublicKey,
  chunk,
  publicKey,
  assertAccountExists,
  RpcGetAccountsOptions,
  isPublicKey,
  base58PublicKey,
} from "@metaplex-foundation/umi";
import { Token } from "@metaplex-foundation/mpl-essentials";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { deserializeDigitalAsset, DigitalAsset } from "./digitalasset";
import {
  TokenRecord,
  findMetadataPda,
  findMasterEditionPda,
} from "./generated";
import { JsonMetadata } from "mintee-utils/dist/types";
import { prismaModels } from "mintee-database";
export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    const umi = createUmi(env.rpcUrl).use(mplTokenMetadata());

    // grab 10 NFTs at a time
    let tokensLeft = true;
    let offset = 10;
    while (tokensLeft) {
      const nftsWindowCall = await conn.execute(
        "SELECT * FROM NFT ORDER BY id ASC LIMIT 10 OFFSET ?;",
        [offset]
      );

      const nftsDBInfo = nftsWindowCall.rows as prismaModels.NFT[];

      const CronJobUpdatte = nftsDBInfo.filter((token) =>
        isPublicKey(token.blockchainAddress)
      );

      const cronTokenObject: {
        [key: string]: {
          nftDB: prismaModels.NFT;
          onChain?: DigitalAsset;
          offChain?: JsonMetadata;
        };
      } = {};

      for (const item of CronJobUpdatte) {
        cronTokenObject[item.blockchainAddress] = {
          nftDB: item,
          onChain: undefined,
          offChain: undefined,
        };
      }

      // quickly alert about invalid token addresses
      if (CronJobUpdatte.length != nftsDBInfo.length) {
        console.log("Error: Not all addresses are valid public keys");
        const nonValidAddresses = nftsDBInfo.filter(
          (n) => !isPublicKey(n.blockchainAddress)
        );
        console.log("The following addresses are not valid public keys:");
        nonValidAddresses.forEach((n) => console.log(n.blockchainAddress));
        return;
      }

      const publicKeys = Object.keys(cronTokenObject).map((key) => {
        return publicKey(key);
      });

      // prepare offChain request
      const tokenAddressAndUri: tokenAddAndUri = Object.entries(
        cronTokenObject
      ).map(([key, value]) => {
        return {
          blockchainAddress: key,
          uri: value.nftDB.uri,
        };
      });

      fetchAllOffChain(tokenAddressAndUri).catch((e) => {
        console.log("Parent error fetching all off chain data: ", e);
      });

      // on chain call
      fetchAllDigitalAsset(umi, publicKeys).catch((e) => {
        console.log("Parent error fetching all digital assets: ", e);
      });

      const [offChainData, OnChainData] = await Promise.all([
        fetchAllOffChain(tokenAddressAndUri),
        fetchAllDigitalAsset(umi, publicKeys),
      ]);

      // map the off chain data to cronTokenObject and update database
      for (const offChainInfoStatus of offChainData) {
        const onChainData = OnChainData.find((onChain) => {
          base58PublicKey(onChain.publicKey);
        });

        if (offChainInfoStatus.status === "rejected") {
          console.log(
            "Error: Off chain data not found for token: ",
            offChainInfoStatus.reason
          );
          continue;
        }
        const offChainInfo = offChainInfoStatus.value;

        if (!onChainData) {
          console.log(
            "Error: On chain data not found for token: ",
            offChainInfo.blockchainAddress
          );
          continue;
        }
        cronTokenObject[offChainInfo.blockchainAddress].offChain = offChainInfo;
        cronTokenObject[offChainInfo.blockchainAddress].onChain = onChainData;

        await conn.execute(
          "UPDATE NFT SET name = ?, symbol = ?, uri = ?, description = ?, image = ?, sellerFeeBasisPoints = ?, isMutable = ?, tokenStandard = ?, primarySaleHappened = ? WHERE blockchainAddress = ?",
          [
            onChainData.metadata.name,
            onChainData.metadata.symbol,
            onChainData.metadata.uri,
            offChainInfo.offChain?.description,
            offChainInfo.offChain?.image,
            onChainData.metadata.sellerFeeBasisPoints,
            onChainData.metadata.isMutable,
            onChainData.metadata.tokenStandard as any,
            onChainData.metadata.primarySaleHappened,
            offChainInfo.blockchainAddress,
          ]
        );

        if (nftsWindowCall.rows.length < offset) {
          tokensLeft = false;
        }

        offset += 10;
      }
    }
  },
};

type NFTUpdateObject = {
  offChain: JsonMetadata;
  onChain: DigitalAsset;
  database: prismaModels.NFT;
};

type tokenAddAndUri = {
  blockchainAddress: string;
  uri: string | null;
}[];
export type DigitalAssetWithToken = DigitalAsset & {
  token: Token;
  tokenRecord?: TokenRecord;
};

async function fetchAllOffChain(tokensAndUri: tokenAddAndUri) {
  // create an array of promies to fetch all the off chain data
  const offChainPromises = tokensAndUri.map(async (token) => {
    if (!token.uri)
      return {
        blockchainAddress: token.blockchainAddress,
        offChain: undefined,
      };
    const offChainData = await fetch(token.uri)
      .then(async (res) => (await res.json()) as any as JsonMetadata)
      .catch((e) => {
        console.log("Error fetching off chain data: ", e);
      });

    if (!offChainData)
      return {
        blockchainAddress: token.blockchainAddress,
        offChain: undefined,
      };

    return {
      blockchainAddress: token.blockchainAddress,
      offChain: offChainData,
    };
  });
  return Promise.allSettled(offChainPromises);
}

export async function fetchAllDigitalAsset(
  context: Pick<Context, "rpc" | "serializer" | "eddsa" | "programs">,
  mints: PublicKey[],
  options?: RpcGetAccountsOptions
): Promise<DigitalAsset[]> {
  const accountsToFetch = mints.flatMap((mint) => [
    mint,
    findMetadataPda(context, { mint }),
    findMasterEditionPda(context, { mint }),
  ]);

  const accounts = await context.rpc.getAccounts(accountsToFetch, options);
  return chunk(accounts, 3).map(
    ([mintAccount, metadataAccount, editionAccount]) => {
      assertAccountExists(mintAccount, "Mint");
      assertAccountExists(metadataAccount, "Metadata");
      return deserializeDigitalAsset(
        context,
        mintAccount,
        metadataAccount,
        editionAccount.exists ? editionAccount : undefined
      );
    }
  );
}

export async function fetchDigitalAsset(
  context: Pick<Context, "rpc" | "serializer" | "eddsa" | "programs">,
  mint: PublicKey,
  options?: RpcGetAccountsOptions
): Promise<DigitalAsset> {
  const metadata = findMetadataPda(context, { mint });
  const edition = findMasterEditionPda(context, { mint });
  const [mintAccount, metadataAccount, editionAccount] =
    await context.rpc.getAccounts([mint, metadata, edition], options);
  assertAccountExists(mintAccount, "Mint");
  assertAccountExists(metadataAccount, "Metadata");
  return deserializeDigitalAsset(
    context,
    mintAccount,
    metadataAccount,
    editionAccount.exists ? editionAccount : undefined
  );
}
