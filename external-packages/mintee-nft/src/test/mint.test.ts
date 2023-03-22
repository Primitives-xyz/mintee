import { assert, describe, expect, test } from "vitest";
import sinon from "sinon";
import { Mintee } from "..";

describe("Mintee mint info test", () => {
  test("Mintee mint method calls fetch with correct arguments devnet", async () => {
    const apiKey = "bWFoZWxlZGFpbHlAZ21haWwuY29tOjE2NzkyODA3NTQxODM";
    const apiUrl = "https://api.mintee.io/";

    const mintee = new Mintee({
      apiKey: "******************DV83",
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
      }),
    });
    mintee.mintNft({ name: "Nick test test" });
    sinon.restore();
  });
});

async function mint() {
  const mintee = Mintee.init({
    apiKey: "******************DV83",
  });

  const mintInfo = await mintee.mintNft({
    name: "Minting has never been easier",
    symbol: "MINT",
  });

  // or

  await fetch("https://api.mintee.io/mint", {
    method: "POST",
    headers: {
      "x-api-key": "******************DV83",
    },
    body: JSON.stringify({ name: "mint with fetch!" }),
  });
}
