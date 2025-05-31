/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,  // Required for static export
  },
  // Disable server-side features since we're doing static export
}

module.exports = nextConfig 