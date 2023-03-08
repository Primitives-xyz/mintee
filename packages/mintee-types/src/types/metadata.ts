/**
 * @internal
 * Metadata for a token
 * @param symbol
 * @param description
 * @param max_uri_length
 * @param name
 */
export type metadataInternal = {
  symbol?: string | undefined;
  description?: string | undefined;
  max_uri_length?: number | undefined;
  name: string;
};
