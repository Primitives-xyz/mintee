// This function gets the NFT info on chain and writes it to the KV.
// The address is used as the key in the KV.
// The tokenInfo is the value.
// The tokenInfo is returned so that it can be used in the caller function.

import { Env } from "..";

/**
 *
 * @param env
 * the environment variables for KV
 * @param address
 * string value of the NFT address
 * @returns
 * Stringified JSON of the NFT info
 * @type string<{nftResponse}>
 */
export async function getNFTInfo({
  env,
  address,
}: {
  env: Env;
  address: string;
}) {
  const factoryResponse = await fetch(`${env.factoryUrl}/api/${address}`).catch(
    (e) => {
      console.log("Error", e);
      throw new Error("Error fetching token" + e);
    }
  );
  const tokenInfo = JSON.stringify(await factoryResponse.json());

  return tokenInfo;
}