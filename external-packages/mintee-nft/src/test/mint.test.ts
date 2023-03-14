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
    const tokenAddress = "FTmkz9oN5PDx1sZ6uHqN7CgMCZYkFH9C86UPGqCQn3SM";
    const apiUrl = "https://api.mintee.io/";
    const onChainResponse = {
      name: "nick 2",
    };

    const mintee = new Mintee({
      apiKey,
      // options: {
      //   network: "devnet",
      // },
    });
    const fetchSpy = sinon.spy(globalThis, "fetch");
    fetchSpy.withArgs(`${apiUrl}nftInfo/${tokenAddress}`, {
      headers: {
        "x-api-key": apiKey,
        network: mintee.network,
      },
    });

    const infoReponse = await mintee.nftInfo({ tokenAddress });
    console.log("infoReponse", infoReponse);
    expect(infoReponse.token).toContain(onChainResponse);

    sinon.restore();
  });
});
