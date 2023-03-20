import { JsonMetadata, Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { NextApiResponse, NextApiRequest } from "next";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { minteeNFTInfo } from "mintee-utils";
import { prismaModels } from "mintee-database";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const network = req.headers.network as string | undefined;
  // parse the query for token address
  const { address } = req.query;
  const tokenPK = new PublicKey(address as string);

  // init metaplex
  if (!tokenPK) return res.status(404).json({ message: "Invalid address" });
  const mp = initMetaplex(network);
  if (!mp)
    return res.status(404).json({ message: "Error connection Solana node" });

  // fetch token
  const token = await mp
    .nfts()
    .findByMint({ mintAddress: tokenPK })
    .catch((e) => {
      console.log("Error", e);
    });

  if (!token) {
    return res.status(404).json({ message: "Token not found" });
  }
  const response: minteeNFTInfo = {
    ...token,
    blockchainAddress: token.address.toBase58(),
    tokenStandard: token.tokenStandard!,
    editionNonce: token.editionNonce ?? undefined,
    collection: {
      address: token.collection?.address?.toBase58() ?? undefined,
      verified: token.collection?.verified ?? undefined,
    },
    updateAuthorityAddress: token.updateAuthorityAddress?.toBase58(),
    uses: token.uses?.useMethod,
    creators: token.creators.map((c) => ({
      address: c.address.toBase58(),
      verified: c.verified,
      share: c.share,
    })),
  };
  return res.status(200).json(response);
}

function initMetaplex(network?: string) {
  const url =
    !network || network !== "mainnet"
      ? process.env.RPC_URL_DEVNET
      : process.env.RPC_URL;
  if (!url) {
    throw new Error("RPC_URL not set");
  }
  const connection = new Connection(url, "confirmed");
  return Metaplex.make(connection);
}
