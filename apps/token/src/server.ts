import {
  DigitalAsset,
  deserializeDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  Context,
  PublicKey,
  RpcGetAccountsOptions,
  chunk,
  assertAccountExists,
  base58PublicKey,
  publicKey,
} from "@metaplex-foundation/umi";
//@ts-ignore

import Fastify, { FastifyInstance } from "fastify";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { findMetadataPda, findMasterEditionPda } from "./generated";
import { JsonMetadata } from "mintee-utils";
import { PrismaClient } from "mintee-database";
import { prismaModels } from "mintee-database";
const server: FastifyInstance = Fastify({});

const prisma = new PrismaClient();
prisma.$connect();

server.get("/hello/", async (request, reply) => {
  return { hello: "world" };
});

server.get("/", async (request, reply) => {
  return { hello: "world index" };
});

server.get("/tokenCron", async (request, reply) => {
  // grab 10 NFTs at a time
  let tokensLeft = true;
  let offset = 10;
  while (tokensLeft) {
    const nftsDBInfo = await prisma.nFT.findMany({
      skip: offset,
      take: 10,
      orderBy: {
        id: "asc",
      },
    });

    if (nftsDBInfo.length === 0) {
      tokensLeft = false;
    }

    const cronTokenObject: cronObjectType = {};

    for (const item of nftsDBInfo) {
      cronTokenObject[item.blockchainAddress] = {
        nftDB: item,
        onChain: undefined,
        offChain: undefined,
      };
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
      if (offChainInfoStatus.status === "rejected") {
        console.log(
          "Error: Off chain data not found for token: ",
          offChainInfoStatus.reason
        );
        continue;
      }
      const onChainData = OnChainData.filter((onChain) => {
        return (
          offChainInfoStatus.value.blockchainAddress ===
          base58PublicKey(onChain.publicKey)
        );
      })[0];
      const offChainInfo = offChainInfoStatus.value;

      if (!onChainData) {
        continue;
      }
      cronTokenObject[offChainInfo.blockchainAddress].offChain = offChainInfo;
      cronTokenObject[offChainInfo.blockchainAddress].onChain = onChainData;
      const id = cronTokenObject[offChainInfo.blockchainAddress].nftDB.id;
      await prisma.nFT
        .update({
          where: {
            id,
          },
          data: {
            name: onChainData.metadata.name,
            symbol: onChainData.metadata.symbol,
            uri: onChainData.metadata.uri,
            description: offChainInfo.offChain?.description,
            image: offChainInfo.offChain?.image,
            sellerFeeBasisPoints: onChainData.metadata.sellerFeeBasisPoints,
            isMutable: onChainData.metadata.isMutable,
            primarySaleHappened: onChainData.metadata.primarySaleHappened,
          },
        })
        .catch((e: any) => {
          console.log("Error updating nft: ", e);
        });
      if (nftsDBInfo.length < 10) {
        tokensLeft = false;
      }

      offset += 10;
    }
  }
  console.log("Cron job finished");

  return { cronJob: "done" };
});

const start = async () => {
  try {
    await server.listen({ port: 8080 });

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log(`server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();

const umi = createUmi(
  "https://rpc.helius.xyz/?api-key=f30d6a96-5fa2-4318-b2da-0f6d1deb5c83"
).use(mplTokenMetadata());

async function fetchAllDigitalAsset(
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

  const newAccounts = accounts.filter((e) => {
    {
      return e.exists === true;
    }
  });

  return chunk(newAccounts, 3).map(
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

type tokenAddAndUri = {
  blockchainAddress: string;
  uri: string | null;
}[];

async function fetchAllOffChain(tokensAndUri: tokenAddAndUri) {
  // create an array of promies to fetch all the off chain data
  const offChainPromises = tokensAndUri.map(async (token) => {
    if (!token.uri)
      return {
        blockchainAddress: token.blockchainAddress,
        offChain: undefined,
      };
    const offChainData = await fetch(token.uri)
      .then(async (res: any) => (await res.json()) as JsonMetadata)
      .catch((e: unknown) => {
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

type cronObjectType = {
  [key: string]: {
    nftDB: prismaModels.NFT;
    onChain?: DigitalAsset;
    offChain?: JsonMetadata;
  };
};
