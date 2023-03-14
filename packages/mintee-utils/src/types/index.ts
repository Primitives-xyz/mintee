import BN from "bn.js";

export type Uses = {
  useMethod: UseMethod;
  remaining: bignum;
  total: bignum;
};

export declare type bignum = number | BN;

export declare enum UseMethod {
  Burn = 0,
  Multiple = 1,
  Single = 2,
}
export declare enum TokenStandard {
  NonFungible = 0,
  FungibleAsset = 1,
  Fungible = 2,
  NonFungibleEdition = 3,
  ProgrammableNonFungible = 4,
}

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

export declare enum TokenProgramVersion {
  Original = 0,
  Token2022 = 1,
}
export type Creator = {
  address: string;
  verified: boolean;
  share: number;
};
export type Collection = {
  verified: boolean;
  key: string;
};
