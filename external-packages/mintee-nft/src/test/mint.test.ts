import { assert, describe, expect, test } from "vitest";
import sinon from "sinon";
import { Mintee } from "..";

describe("Mintee mint info test", () => {
  test("Mintee mint method calls fetch with correct arguments devnet", async () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";
    const apiUrl = "https://api.mintee.io/";

    const mintee = new Mintee({
      apiKey,
      options: {
        network: "devnet",
      },
    });
    const fetchSpy = sinon.spy(globalThis, "fetch");
    fetchSpy.withArgs(`${apiUrl}mint`, {
      headers: {
        "x-api-key": apiKey,
        network: mintee.network,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          name: "Nick test test",
        },
        options: {
          toWallet: undefined,
        },
      }),
    });
    mintee.mintNft({ name: "Nick test test" });
    sinon.restore();
  });
});
