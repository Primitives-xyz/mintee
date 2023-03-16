# Mintee.js - The easiest to use NFT API

Mintee.js is a simple way to use the Mintee API for minting NFTs on the Solana blockchain.

# Getting Started

```shell filename="shell"  copy
npm install mintee-nft
```

You can interact with Mintee by using our npm package or by using our API directly.

# Generating An API Key

Visit the [Mintee Sign Up](https://mintee.io/sign-up) and generate an API key.

# Using The API

```typescript filename="typescript" {4} copy
import { Mintee } from "mintee-nft";

const apiKey = "YOUR_API_KEY";
const mintee = new Mintee({ apiKey });

// or use make // devnet
// const mintee = Mintee.make({apiKey}, options: {
//  network: 'devnet'
// })

const tokenAddress = "214gAnKQUfFoD6AW4aRtETJNA73WZ3mYUybMEp3PDqHy";
const nftInfo = await mintee.nftInfo({ tokenAddress });
console.log(nftInfo);
```

## GET

It is not necessary to install the npm package to easily interact with our api.

```typescript {6} copy
const tokenAddress = "EtNfhjfpP8N71YVFFRvMn9iFzDG1PKaSwKUcBH6LzJVR";
const url = `https://api.mintee.io/nftInfo/${tokenAddress}`;
const response = fetch(url, {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const nftInfo = await response.json();
```
