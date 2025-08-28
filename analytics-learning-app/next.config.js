/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['posthog-node']
  }
}

module.exports = nextConfig