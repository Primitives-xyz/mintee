import { PublicKey } from "@solana/web3.js";
/**
 * Validate the body of the request using zod
 * @param body
 * @returns
 */
export declare function validateMetadataBody(body: any): {
    name: string;
    description?: string | undefined;
    symbol?: string | undefined;
    max_uri_length?: number | undefined;
};
export declare function validateJWTInput(body: any): {
    name: string;
    email: string;
};
export declare function validateSolanaAddress(string: any): false | PublicKey;
