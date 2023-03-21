import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Mintee API</span>,

  project: {
    link: "https://github.com/shuding/nextra-docs-template",
  },
  head: (
    <>
      <title>Mintee Docs!</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Mintee Docs!" />
      <meta
        property="og:description"
        content="The easiest way to mint NFTs at scale"
      />
    </>
  ),
  docsRepositoryBase: "https://docs.mintee.io",
  footer: {
    text: "Mintee API",
  },
};

export default config;
