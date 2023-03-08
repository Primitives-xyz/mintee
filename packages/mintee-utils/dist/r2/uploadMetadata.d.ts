import { R2Bucket } from "@cloudflare/workers-types";
import type { metadataInternal } from "mintee-types";
/**
 * Upload metadata to a public bucket
 * @param metadata
 * Metadata should be a JSON object that extends Metaplex's Metadata type
 * @param env
 * Env should contain a bucket property that is an instance of R2Bucket
 * @returns
 * Returns a Promise that resolves to the result of the upload
 * @throws
 * Throws an error if the upload fails
 */
export declare function uploadMetadata(metadata: metadataInternal, env: Env, key: string): Promise<import("@cloudflare/workers-types").R2Object>;
export interface Env {
    rpcUrl: string;
    r2Url: string;
    bucket: R2Bucket;
}
//# sourceMappingURL=uploadMetadata.d.ts.map