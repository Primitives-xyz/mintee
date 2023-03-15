import { assert, describe, expect, test } from "vitest";
import sinon from "sinon";
import { Mintee } from "..";

const devnetestTokens = {
  FzLVJJG5WSHyuHWP1YXHCJ3xB7snVEEA9XTEsX5Yc6fq: {
    name: "nickie",
  },
  ErUN3NFr7DJeQpHvoucHZB2a3pqGtysJRJc9PtsEFcKD: {
    name: "nick 2",
  },
  "6vm6opAMVebeiYcYYoWwjvoE5KjNCrF7Lz8PknyxCdzJ": {
    name: "nick test drop",
  },
};

const mainnetTestTokens = {
  Cs1i6fN4PJe7bhFFfWs1JMZj3PdDqpL9mP3U93LgsySF: {
    name: "chizygram",
  },
  GP9JZgsTmksbD6zvmG4nx2nhHkhdfKPwt9J3aqk66fS8: {
    name: "decent",
  },
  "8kZshW1xgneLSZo7esCA7xEmiMQqitNV1wDjBSp7RL5z": {
    name: "bounce0001",
  },
};

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

  test("Mintee nftInfo method calls fetch with correct arguments devnet", async () => {
    const apiKey = "am9obm55d29vZHRrZUBnbWFpbC5jb206MTY3ODc2NDgwODQyNA==";
    const apiUrl = "https://api.mintee.io/";

    const mintee = new Mintee({
      apiKey,
      options: {
        network: "devnet",
      },
    });

    for (const [key, value] of Object.entries(devnetestTokens)) {
      const onChainResponse = {
        name: value.name,
      };
      const fetchSpy = sinon.spy(globalThis, "fetch");
      fetchSpy.withArgs(`${apiUrl}nftInfo/${key}`, {
        headers: {
          "x-api-key": apiKey,
          network: mintee.network,
        },
      });
      const infoReponse = await mintee.nftInfo({ tokenAddress: key });
      expect(infoReponse.token).toContain(onChainResponse);

      sinon.restore();
    }
  });
  test("Mintee nftInfo method calls fetch with correct arguments mainnet", async () => {
    const apiKey = "am9obm55d29vZHRrZUBnbWFpbC5jb206MTY3ODc2NDgwODQyNA==";
    const apiUrl = "https://api.mintee.io/";

    const mintee = new Mintee({
      apiKey,
    });

    for (const [key, value] of Object.entries(mainnetTestTokens)) {
      const onChainResponse = {
        name: value.name,
      };
      const fetchSpy = sinon.spy(globalThis, "fetch");
      fetchSpy.withArgs(`${apiUrl}nftInfo/${key}`, {
        headers: {
          "x-api-key": apiKey,
          network: mintee.network,
        },
      });
      const infoReponse = await mintee.nftInfo({ tokenAddress: key });
      expect(infoReponse.token).toContain(onChainResponse);

      sinon.restore();
    }
  });
  test("Mintee nft info doesn't return token with invalid api key", async () => {
    const apiKey = "badkey";
    const apiUrl = "https://api.mintee.io/";

    const mintee = new Mintee({
      apiKey,
    });

    for (const [key, value] of Object.entries(mainnetTestTokens)) {
      const fetchSpy = sinon.spy(globalThis, "fetch");

      fetchSpy.withArgs(`${apiUrl}nftInfo/${key}`, {
        headers: {
          "x-api-key": apiKey,
          network: mintee.network,
        },
      });

      // in vitest, expect the function to throw an
      const infoReponse = await mintee
        .nftInfo({ tokenAddress: key })
        .catch((e) => {
          console.log("error", e);
        });
      expect(infoReponse).toBeUndefined();

      sinon.restore();
    }
  });
});
