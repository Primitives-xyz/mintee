import type { Env } from "worker-types";
import type { metadataInternal } from "mintee-types";
import { R2Object } from "@cloudflare/workers-types";
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
export declare function uploadMetadata(metadata: metadataInternal, env: Env, key: string): Promise<R2Object>;
