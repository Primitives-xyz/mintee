import { minteeNFTInputSchema, minteeNFTInfo } from "mintee-utils";
import { JsonMetadata } from "mintee-utils/dist/types";
import { minteeNFTInput } from "mintee-utils/dist/zod";
export class Mintee {
  /** The connection object from Solana's SDK. */
  public readonly apiKey: string;
  /** The cluster in which the connection endpoint belongs to. */
  public readonly network: "mainnet" | "testnet" | "devnet";
  private readonly apiUrl: string;

  constructor({
    apiKey,
    options,
  }: {
    apiKey: string;
    options?: minteeOptions;
  }) {
    this.apiKey = apiKey;
    this.network = options?.network || "mainnet";
    this.apiUrl = `https://api.noxford1.workers.dev/`;
  }

  static init({
    apiKey,
    options,
  }: {
    apiKey: string;
    options?: minteeOptions;
  }) {
    return new this({ apiKey, options });
  }

  /**
   * Mint a new NFT
   *
   * @param name,
   * @param symbol,
   * @param metadata,
   * @returns
   */
  async mintNft(nftInput: minteeNFTInput, options?: minteeOptions) {
    const data = await minteeNFTInputSchema.parseAsync(nftInput).catch((e) => {
      throw new Error(e);
    });
    const url = `${this.apiUrl}mint`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": `${this.apiKey}`,
        "Content-Type": "application/json",
        network: options?.network ?? this.network,
      },
      body: JSON.stringify({
        data,
        options: {
          toWallet: options?.toWallet ? options.toWallet : undefined,
        },
      }),
    }).catch((e) => {
      console.log("error", e);
      throw new Error(e);
    });
    const token = (await response
      .json()
      .catch((e) => {})) as mintCompressedResponse;
    return token;
  }

  async nftInfo({
    tokenAddress,
    options,
  }: {
    tokenAddress: string;
    options?: minteeOptions;
  }) {
    const url = `${this.apiUrl}nftInfo/${tokenAddress}`;
    const response = await fetch(url, {
      headers: {
        "x-api-key": `${this.apiKey}`,
        network: options?.network ?? this.network,
      },
    }).catch((e) => {
      throw new Error(e);
    });
    const token: minteeNFTInfo = await response.json().catch((e) => {
      console.log("error", e);
      throw new Error(e);
    });
    return token;
  }
  /**
   * Grab the most up to date on chain NFT data. Good for checking state of programmable NFT.
   *
   * @param tokenAddress
   * @param options
   * @returns
   */
  async nftStatus({
    tokenAddress,
    options,
  }: {
    tokenAddress: string;
    options?: minteeOptions;
  }) {
    const url = `${this.apiUrl}nftStatus/${tokenAddress}`;
    const response = await fetch(url, {
      headers: {
        "x-api-key": `${this.apiKey}`,
        network: options?.network ?? this.network,
      },
    }).catch((e) => {
      throw new Error(e);
    });
    const token: nftResponse = await response.json().catch((e) => {
      console.log("error", e);
      throw new Error(e);
    });
    return token;
  }
}

declare enum TokenStandard {
  NonFungible = 0,
  FungibleAsset = 1,
  Fungible = 2,
  NonFungibleEdition = 3,
  ProgrammableNonFungible = 4,
}
type nftResponse = {
  offChain: JsonMetadata<string> | null;
  token: {
    name: string;
    symbol: string;
    address: string;
    collectionAddress?: string;
    uri: string;
    editionNonce: number | null;
    tokenStandard: TokenStandard | null;
  };
};

type minteeOptions = {
  network: networkStringLiteral;
  toWallet?: string;
};

export type networkStringLiteral = "mainnet" | "testnet" | "devnet";

export type mintCompressedResponse = {
  assetId: string;
  leafIndex: number;
  treeWalletAddress: string;
};
