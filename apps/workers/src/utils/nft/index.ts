// This function gets the NFT info on chain and writes it to the KV.
// The address is used as the key in the KV.
// The tokenInfo is the value.
// The tokenInfo is returned so that it can be used in the caller function.

import { Env } from "..";
export type networkStringLiteral = "mainnet" | "testnet" | "devnet";
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
  network,
}: {
  env: Env;
  address: string;
  network?: networkStringLiteral;
}) {
  const factoryResponse = await fetch(`${env.factoryUrl}/api/${address}`, {
    headers: {
      network: network ? network : "mainnet",
    },
  }).catch((e) => {
    console.log("Error", e);
    throw new Error("Error fetching token" + e);
  });
  const tokenInfo = JSON.stringify(await factoryResponse.json());

  return tokenInfo;
}
