import { MetadataArgs } from "@metaplex-foundation/mpl-bubblegum";
import base58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { NextApiRequest, NextApiResponse } from "next";
import { getCompressedNftId, mintCompressedNft } from "../../utils/mint";
import { ConcurrentMerkleTreeAccount } from "@solana/spl-account-compression";
import { getConnectionWrapper } from "../../utils/connectionWrapper";
import { validateMintCompressBody } from "mintee-utils";
import { PublicKey } from "@metaplex-foundation/js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if type get then return error
  if (req.method === "GET") {
    return res.status(405).json({ error: "GET not allowed" });
  }

  // check header for key cloudflare-worker-key
  const key = req.headers["cloudflare-worker-key"];
  if (!key || key != process.env["WORKER_KEY"]) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const connectionWrapper = getConnectionWrapper();

  const treeWallet = getTreeKP();

  if (!treeWallet) {
    return res.status(500).json({ error: "No tree wallet" });
  }
  const json = req.body;
  console.log("json", json);
  // validate metadata
  const bodyParsePromise = await validateMintCompressBody(json).catch((e) => {
    console.log("Error validating body in factory", e);
  });
  if (!bodyParsePromise) {
    return res.status(500).json({ error: "Error validating body in factory" });
  }
  const [body, options] = bodyParsePromise;
  // Mint a compressed NFT

  if (!options || !options.success) {
    return res.status(500).json({ error: options!.error });
  }
  if (!body.success) {
    return res.status(500).json({ error: body.error });
  }
  const mintCompressedNftPK = body.data.collection?.key
    ? new PublicKey(body.data.collection?.key)
    : undefined;

  await mintCompressedNft(
    connectionWrapper,
    {
      ...body.data,
      symbol: body.data.symbol ?? "",
      uses: body.data.uses ?? null,
      collection: mintCompressedNftPK
        ? {
            key: mintCompressedNftPK,
            verified: body.data.collection!.verified,
          }
        : null,
      creators: body.data.creators?.map((c) => ({
        address: new PublicKey(c.address),
        share: c.share,
        verified: c.verified,
      })),
    } as MetadataArgs,
    connectionWrapper.payer,
    treeWallet,
    options.data?.toWalletAddress
      ? new PublicKey(options.data.toWalletAddress)
      : undefined
  ).catch((e) => {
    console.error(e);
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
  return res.status(200).json({
    assetId,
    leafIndex,
    treeWalletAddress: treeWallet.publicKey.toBase58(),
  });
}

function getTreeKP() {
  const treeWalletSK = process.env["TREE_WALLET_SK"];
  if (!treeWalletSK) {
    return null;
  }
  const treeWallet58 = base58.decode(treeWalletSK);
  return Keypair.fromSecretKey(treeWallet58);
}

type mintCompressedResponse = {
  assetId: string;
  leafIndex: number;
  treeWalletAddress: string;
};
