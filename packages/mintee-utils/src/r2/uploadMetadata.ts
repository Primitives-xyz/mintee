// import types from mantee-types
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
export async function uploadMetadata(
  metadata: metadataInternal,
  env: Env,
  key: string
) {
  return await env.bucket.put(key, JSON.stringify(metadata)).catch((err) => {
    throw new Error(err);
  });
}
export interface Env {
  rpcUrl: string;
  r2Url: string;
  bucket: any;
}
