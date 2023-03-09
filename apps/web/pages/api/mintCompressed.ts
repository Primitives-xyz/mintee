import {
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import base58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { getCompressedNftId, mintCompressedNft } from "../../utils/mint";
import { WrappedConnection } from "../../utils/wrappedConnection";
import { PublicKey } from "@metaplex-foundation/js";
import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = process.env["API_KEY"];
  if (!apiKey) {
    throw new Error("Api key must be provided via API_KEY env var");
  }
  const connectionString = `https://rpc-devnet.helius.xyz?api-key=${apiKey}`;
  const secretKey = process.env["SECRET_KEY"];
  if (!secretKey) {
    throw new Error(
      "Wallet secret key must be provided via SECRET_KEY env var"
    );
  }
  console.log("query", req.query);
  // grab search params
  const {
    collectionMintAddress,
    collectionMetadataAccountAddress,
    collectionMasterEditionAccountAddress,
  } = req.query;
  let decodedSecretKey;
  try {
    decodedSecretKey = base58.decode(secretKey);
  } catch {
    throw new Error(
      "Invalid secret key provided. Must be a base 58 encoded string."
    );
  }
  const ownerWallet = Keypair.fromSecretKey(decodedSecretKey);
  const connectionWrapper = new WrappedConnection(
    ownerWallet,
    connectionString
  );

  const treeWallet = Keypair.generate();

  // Mint a compressed NFT
  const nftArgs = {
    name: "Compression Test",
    symbol: "COMP",
    uri: "https://arweave.net/gfO_TkYttQls70pTmhrdMDz9pfMUXX8hZkaoIivQjGs",
    creators: [],
    editionNonce: 253,
    tokenProgramVersion: TokenProgramVersion.Original,
    tokenStandard: TokenStandard.NonFungible,
    uses: null,
    collection: null,
    primarySaleHappened: false,
    sellerFeeBasisPoints: 0,
    isMutable: false,
  };
  const {
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  } = convertCollectionPublicKeys({
    collectionMintAddress,
    collectionMetadataAccountAddress,
    collectionMasterEditionAccountAddress,
  });
  const sig = await mintCompressedNft(
    connectionWrapper,
    nftArgs,
    ownerWallet,
    treeWallet,
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount
  ).catch((e) => {
    console.error(e);
    return res.status(500).json({ error: e.message });
  });
  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    connectionWrapper,
    treeWallet.publicKey
  ).catch((e) => {
    console.error(e);
    return res.status(500).json({ error: e.message });
  });
  // Get the most rightmost leaf index, which will be the most recently minted compressed NFT.
  // Alternatively you can keep a counter that is incremented on each mint.
  if (!treeAccount) {
    return res.status(500).json({ error: "Failed to get tree account" });
  }
  const leafIndex = treeAccount.tree.rightMostPath.index - 1;
  const assetId = await getCompressedNftId(treeWallet, leafIndex);
  return res.status(200).json({ assetId });
}

function convertCollectionPublicKeys({
  collectionMintAddress,
  collectionMetadataAccountAddress,
  collectionMasterEditionAccountAddress,
}: {
  collectionMintAddress: string | string[] | undefined;
  collectionMetadataAccountAddress: string | string[] | undefined;
  collectionMasterEditionAccountAddress: string | string[] | undefined;
}) {
  // if any of args are undefined throw an error
  if (
    !collectionMintAddress ||
    !collectionMetadataAccountAddress ||
    !collectionMasterEditionAccountAddress
  ) {
    throw new Error("Collection args must be provided");
  }
  // if any of args are not strings throw an error
  if (
    typeof collectionMintAddress !== "string" ||
    typeof collectionMetadataAccountAddress !== "string" ||
    typeof collectionMasterEditionAccountAddress !== "string"
  ) {
    throw new Error("Collection args must be strings");
  }

  const collectionMint = new PublicKey(collectionMintAddress);
  const collectionMetadataAccount = new PublicKey(
    collectionMetadataAccountAddress
  );
  const collectionMasterEditionAccount = new PublicKey(
    collectionMasterEditionAccountAddress
  );
  return {
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  };
}
