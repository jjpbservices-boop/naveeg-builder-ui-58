/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  transpilePackages: ['@naveeg/lib', '@naveeg/ui'], // 👈 important for env access
}

module.exports = nextConfig
