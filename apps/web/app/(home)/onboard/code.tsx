"use client";

import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function CodeView({ apiKey }: { apiKey?: string }) {
  const [apiKkey, setApiKey] = useState<string | undefined>(apiKey);

  useEffect(() => {
    console.log("API KEY", apiKey);
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, [apiKey]);

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
          {`npm install mintee.js`}
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
          {`import { Mintee } from "mintee.js"
  
  async function mintNFT() {
    // initialize mintee with your api key
    const mintee = Mintee.init({
    apiKey: "${apiKkey ?? ""}"});
  
    // mint nft 
    return await mintee.mintNft({ name: "test_nft", symbol: "test" });
  )} `}
        </SyntaxHighlighter>
      </div>
    </>
  );
}
