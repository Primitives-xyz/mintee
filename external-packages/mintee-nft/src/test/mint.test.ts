import { assert, describe, expect, test } from "vitest";
import sinon from "sinon";
import { Mintee } from "..";
describe("Mintee", () => {
  test("Mintee initializes with apiKey and options", () => {
    const apiKey = "test-api-key";
    const network: "devnet" | "mainnet" | "testnet" = "devnet";
    const options = { network };
    const mintee = new Mintee({ apiKey, options });

    assert.equal(mintee.apiKey, apiKey);
    assert.equal(mintee.network, network);
  });

  test("Mintee initializes with apiKey only", () => {
    const apiKey = "test-api-key";
    const mintee = Mintee.make({
      apiKey,
      options: {
        network: "devnet",
      },
    });
    assert.equal(mintee.apiKey, apiKey);
    assert.equal(mintee.network, "devnet");
  });

  test("Mintee nftInfo method calls fetch with correct arguments", async () => {
    const apiKey = "am9obm55d29vZHRrZUBnbWFpbC5jb206MTY3ODc2NDgwODQyNA==";
    const tokenAddress = "2dVeNCGjQp4atVDW7ASLyaed4rzZ3wEKevFFQuh8Yn6C";
    const apiUrl = "https://api.mintee.io/";
    const onChainResponse = {
      name: "testavatar",
      symbol: "PRIM",
      address: tokenAddress,
      uri: "https://dw2h1frcjb7pw.cloudfront.net/6cf6bf512b7b0d5c.json",
      editionNonce: 255,
      tokenStandard: 0,
    };

    const mintee = new Mintee({
      apiKey,
    });
    const fetchSpy = sinon.spy(globalThis, "fetch");
    fetchSpy.withArgs(`${apiUrl}nftInfo/${tokenAddress}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        network: mintee.network,
      },
    });

    const infoReponse = await mintee.nftInfo({ tokenAddress });
    expect(infoReponse.token).toContain(onChainResponse);

    sinon.restore();
  });
});
