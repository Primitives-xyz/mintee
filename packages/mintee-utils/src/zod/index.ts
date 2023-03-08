import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
/**
 * Validate the body of the request using zod
 * @param body
 * @returns
 */
export function validateMetadataBody(body: any) {
  const schema = z.object({
    name: z.string().min(1).max(32),
    description: z.string().optional(),
    symbol: z.string().max(10).optional(),
    max_uri_length: z.number().max(100).optional(),
  });

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error("invalid body");
  }
  return result.data;
}

export function validateJWTInput(body: any) {
  const schema = z.object({
    name: z.string().max(32),
    email: z.string().email("wrong"),
  });

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error("invalid body");
  }
  return result.data;
}

export function validateSolanaAddress(string: any) {
  // check if address is Solana public key
  const address = z.string().refine((address) => {
    try {
      new PublicKey(address);
      return true;
    } catch (e) {
      return false;
    }
  }, "Invalid Solana address");

  const result = address.safeParse(string);
  if (!result.success) {
    return false;
  }
  return new PublicKey(result);
}
