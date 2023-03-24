import { z } from "zod";
import BN from "bn.js";

enum TokenStandard {
  NonFungible = 0,
  FungibleAsset = 1,
  Fungible = 2,
  NonFungibleEdition = 3,
  ProgrammableNonFungible = 4,
}
export type minteeNFTInput = z.infer<typeof minteeNFTInputSchema>;

export type minteeNFTInfo = minteeNFTInput & {
  blockchainAddress: string;
  updateAuthorityAddress: string;
};

export type Uses = {
  useMethod: UseMethod;
  remaining: bignum;
  total: bignum;
};

export type bignum = number | BN;

export enum UseMethod {
  Burn = 0,
  Multiple = 1,
  Single = 2,
}

export enum TokenProgramVersion {
  Original = 0,
  Token2022 = 1,
}
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

type JsonMetadata<Uri = string> = {
  name?: string;
  symbol?: string;
  description?: string;
  seller_fee_basis_points?: number;
  image?: Uri;
  external_url?: Uri;
  attributes?: Array<{
    trait_type?: string;
    value?: string;
    [key: string]: unknown;
  }>;
  properties?: {
    creators?: Array<{
      address?: string;
      share?: number;
      [key: string]: unknown;
    }>;
    files?: Array<{
      type?: string;
      uri?: Uri;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

export const minteeNFTInputSchema = z.object({
  name: z.string(),
  symbol: z.string().max(10).default("").optional(),
  description: z.string().max(1000).optional(),
  uri: z.string().max(200).optional(),
  sellerFeeBasisPoints: z.number().min(0).max(10000).optional(),
  primarySaleHappened: z.boolean().optional(),
  isMutable: z.boolean().optional(),
  editionNonce: z.number().optional(),
  isCollecttion: z.boolean().optional(),
  tokenStandard: z.nativeEnum(TokenStandard).default(0).optional(),
  collection: z
    .object({
      verified: z.boolean().optional(),
      address: z.string().max(200).optional(),
      key: z.string().max(200).optional(),
    })
    .optional(),
  uses: z.nativeEnum(UseMethod).optional(),
  tokenProgramVersion: z.nativeEnum(TokenProgramVersion).default(0).optional(),
  creators: z
    .array(
      z.object({
        address: z.string().max(200),
        verified: z.boolean().optional(),
        share: z.number().min(0).max(100),
      })
    )
    .optional(),
  image: z.string().max(200).optional(),
  externalUrl: z.string().max(200).optional(),
  attributes: z
    .array(
      z.object({
        trait_type: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
  properties: z
    .object({
      creators: z
        .array(
          z.object({
            address: z.string().max(200),
            share: z.number().min(0).max(100),
          })
        )
        .optional(),
      files: z
        .array(
          z.object({
            type: z.string().optional(),
            uri: z.string().max(200),
          })
        )
        .optional(),
    })
    .optional(),
});
