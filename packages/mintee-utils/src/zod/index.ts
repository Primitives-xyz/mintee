import { z } from "zod";
import { TokenStandard, UseMethod, TokenProgramVersion } from "../types";

export async function validateMintCompressBody(json: {
  data: any;
  options?: any;
}) {
  if (!json.data) {
    throw new Error(
      "The body is null, try using our npm package instead: https://www.npmjs.com/package/mintee-nft"
    );
  }
  if (!json.options) {
    json.options = {};
  }
  const body = mintCompressBodySchema.safeParseAsync(json.data);

  const options = mintCompressOptionsSchema.safeParseAsync(json.options);

  // const options = mintCompressOptionsSchema.parseAsync(json.options);
  return await Promise.all([body, options]).catch((e) => {
    console.log("Error parsing body", e);
  });
}

// combine zode schemas

export const mintCompressOptionsSchema = z
  .object({
    toWalletAddress: z.string().max(200).optional(),
    network: z.string().max(200).optional(),
  })
  .optional()
  .nullable();

//  parse json.data.name with Zod

export const mintCompressBodySchema = z.object({
  name: z.string(),
  symbol: z.string().max(10).default("").optional(),
  uri: z.string().max(200).default(""),
  sellerFeeBasisPoints: z.number().min(0).max(10000).default(0),
  primarySaleHappened: z.boolean().default(false),
  isMutable: z.boolean().default(true),
  editionNonce: z.number().optional(),
  tokenStandard: z.nativeEnum(TokenStandard).default(0).optional(),
  collection: z
    .object({
      verified: z.boolean().optional(),
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
});
export type mintCompressBody = z.infer<typeof mintCompressBodySchema>;
