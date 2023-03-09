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
import { getConnectionWrapper } from "../../utils/connectionWrapper";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if type get then return error
  if (req.method === "GET") {
    return res.status(405).json({ error: "GET not allowed" });
  }
  const connectionWrapper = getConnectionWrapper();

  const treeWalletSK = process.env["TREE_WALLET_SK"];
  if (!treeWalletSK) {
    return res.status(500).json({ error: "Invalid tree wallet secret key" });
  }
  const treeWallet58 = base58.decode(treeWalletSK);
  const treeWallet = Keypair.fromSecretKey(treeWallet58);

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
  const sig = await mintCompressedNft(
    connectionWrapper,
    nftArgs,
    connectionWrapper.payer,
    treeWallet
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
