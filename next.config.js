/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 