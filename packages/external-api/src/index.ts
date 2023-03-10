import post from "@noxford1/post";
export class Mintee {
  /** The connection object from Solana's SDK. */
  public readonly apiKey: string;

  /** The cluster in which the connection endpoint belongs to. */
  public readonly network: "mainnet" | "testnet" | "devnet";

  public readonly apiUrl: string;

  constructor({
    apiKey,
    options,
  }: {
    apiKey: string;
    options?: { network: "mainnet" | "testnet" | "devnet" };
  }) {
    this.apiKey = apiKey;
    this.network = options?.network || "mainnet";
    this.apiUrl = `https://api.noxford1.workers.dev/`;
  }

  static make(apiKey: string) {
    return new this({ apiKey });
  }

  async nftInfo({ tokenAddress }: { tokenAddress: string }) {
    const url = `${this.apiUrl}/nftInfo/${tokenAddress}`;
    const response = await fetch(url);
    const token: nftResponse = await response.json().catch((e) => {
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
export type JsonMetadata<Uri = string> = {
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
  collection?: {
    name?: string;
    family?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
