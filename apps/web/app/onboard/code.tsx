"use client";

import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function CodeView({ apiKey }: { apiKey?: string }) {
  return (
    <>
      <div className="mt-4">
        <SyntaxHighlighter
          language="bash"
          style={docco}
          customStyle={{
            borderRadius: "10px",
          }}
        >
          {`npm install mintee-nft`}
        </SyntaxHighlighter>
      </div>
      <h1 className="text-lg font-bold mt-2">Mint your first NFT</h1>
      <div className="mt-4">
        <SyntaxHighlighter
          language="typescipt"
          style={docco}
          customStyle={{
            borderRadius: "10px",
          }}
        >
          {`import { Mintee } from "mintee-nft"
  
  async function mintNFT() {
    // initialize mintee with your api key
    const mintee = Mintee.make({
    apiKey: "${apiKey ?? ""}"});
  
    // mint nft 
    return await mintee.mintNft({ name: "test_nft", symbol: "test" });
  )} `}
        </SyntaxHighlighter>
      </div>
    </>
  );
}
