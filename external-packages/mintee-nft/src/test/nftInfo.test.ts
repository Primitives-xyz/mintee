import { assert, describe, expect, test } from "vitest";
import sinon from "sinon";
import { Mintee } from "..";

const devnetestTokens = {
  TrV9F1yRrKhy1LRGKSvnGwGcc2R8VfcmiBJnQZvPLq3: {
    name: "nick1234",
  },
  ExeUMscaVZV2NGMTpKUEwRVaL87ELD7JXcWq3BBJ4Rk: {
    name: "nickkyyyy",
  },
  "5zo9jR2gfH7Tub5sjt9cuyoyriVrBdmi4KThhb6zqQt4": {
    name: "nick's profile background",
  },
};

const mainnetTestTokens = {
  HVdz1hVzvGdQJeUGrj7Xd2WyRZ3CYYLgkvjEKCF7pJjV: {
    name: "DeGod #9999",
  },
  "364S9Q7Qp5zVX6VduqKJ39TihCosKiBEYw5QmpUM8qaX": {
    name: "Fox #7779",
  },
  "42Z5L8aNrqeq23T3suCWQCDYFoRdr9QvqMmze7HvnNJU": {
    name: "Galactic Gecko #9992",
  },
};

describe("Mintee NFT info test", () => {
  test("Mintee initializes with apiKey and options", () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";
    const network: "devnet" | "mainnet" | "testnet" = "devnet";
    const options = { network };
    const mintee = new Mintee({ apiKey, options });

    assert.equal(mintee.apiKey, apiKey);
    assert.equal(mintee.network, network);
  });

  test("Mintee initializes with apiKey only", () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";
    const mintee = Mintee.init({
      apiKey,
      options: {
        network: "devnet",
      },
    });
    assert.equal(mintee.apiKey, apiKey);
    assert.equal(mintee.network, "devnet");
  });

  test("Devnet - Mintee nftInfo method calls fetch and gets back correct info", async () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";
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
      const infoReponse = await mintee
        .nftInfo({ tokenAddress: key })
        .catch((e) => {
          throw new Error(e);
        });

      expect(infoReponse).toContain(onChainResponse);

      sinon.restore();
    }
  });
  test("Mainnet - Mintee nftInfo method calls fetch and gets back correct info", async () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";

    const mintee = new Mintee({
      apiKey,
    });

    for (const [key, value] of Object.entries(mainnetTestTokens)) {
      const onChainResponse = {
        name: value.name,
      };

      const infoReponse = await mintee.nftInfo({ tokenAddress: key });
      expect(infoReponse).toContain(onChainResponse);

      sinon.restore();
    }
  });
  test("Mintee nft info doesn't return token with invalid api key", async () => {
    const apiKey = "badkey";

    const mintee = new Mintee({
      apiKey,
    });

    for (const [key, value] of Object.entries(mainnetTestTokens)) {
      // in vitest, expect the function to throw an
      const infoReponse = await mintee
        .nftInfo({ tokenAddress: key })
        .catch((e) => {});
      expect(infoReponse).toBeUndefined();

      sinon.restore();
    }
  });
});
