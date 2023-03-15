/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["upcdn.io", "replicate.delivery"],
  },
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@solana/web3.js"],
};
