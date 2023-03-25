/** @type {import('next').NextConfig} */
const NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["upcdn.io", "replicate.delivery"],
  },
  experimental: {
    appDir: true,
    mdxRs: true,
  },
  transpilePackages: ["@solana/web3.js"],
};

const withMDX = require("@next/mdx")();
module.exports = withMDX(NextConfig);
