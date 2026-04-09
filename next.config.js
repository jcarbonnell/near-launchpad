/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@near-wallet-selector/core',
    '@near-wallet-selector/modal-ui',
    '@near-wallet-selector/my-near-wallet',
    '@near-wallet-selector/here-wallet',
    '@near-wallet-selector/bitte-wallet',
  ],
}

module.exports = nextConfig
