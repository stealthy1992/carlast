/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'cdn.sanity.io',   // ✅ required for Next.js Image component with Sanity assets
    ],
  },
}

module.exports = nextConfig