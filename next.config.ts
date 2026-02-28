import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@google-cloud/text-to-speech'],
}
export default nextConfig
