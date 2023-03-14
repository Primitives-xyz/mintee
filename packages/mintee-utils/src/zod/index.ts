import { z } from "zod";
import { TokenProgramVersion, TokenStandard, UseMethod } from "../types";

export async function validateMintCompressBody(json: any) {
  if (!json.body) {
    throw new Error(
      "The body is null, try using our npm package instead: https://www.npmjs.com/package/mintee-nft"
    );
  }
  const body = mintCompressBodySchema.parseAsync(json.body);
  const options = mintCompressOptionsSchema.parseAsync(json.options);

  return await Promise.all([body, options]);
}

// combine zode schemas

export const mintCompressOptionsSchema = z.object({
  toWalletAddress: z.string().min(1).max(200).optional(),
  network: z.string().min(1).max(200).optional(),
});

export const mintCompressBodySchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10).default(""),
  uri: z.string().max(200).default(""),
  sellerFeeBasisPoints: z.number().min(0).max(10000).default(0),
  primarySaleHappened: z.boolean().default(false),
  isMutable: z.boolean().default(true),
  editionNonce: z.number().nullable(),
  tokenStandard: z.nativeEnum(TokenStandard).default(0),
  collection: z
    .object({
      verified: z.boolean().optional(),
      key: z.string().min(1).max(200).optional(),
    })
    .optional(),
  uses: z.nativeEnum(UseMethod).nullable(),
  tokenProgramVersion: z.nativeEnum(TokenProgramVersion).default(0),
  creators: z.array(
    z.object({
      address: z.string().min(1).max(200),
      verified: z.boolean().optional(),
      share: z.number().min(0).max(100),
    })
  ),
});
